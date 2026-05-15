import { createAuditEvent, createEvidenceAuditEvents } from "./audit";
import { calculateScoreChange, recalculateComponentScore } from "./score-recalculation";
import { validateComponent } from "./validation";
import { validateEvidenceEvent as runEvidenceValidation } from "./evidence-validation";
import type {
  EvidenceDocument,
  EvidenceEvent,
  EvidenceProcessingResult,
  EvidenceProcessingState,
  EvidenceValidationResult,
  ScoreChange
} from "./evidence-types";
import type { PackagingComponent } from "./types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getEventObjectId(event: EvidenceEvent) {
  return event.component_id ?? event.packaging_id ?? event.product_id ?? event.supplier_id ?? event.event_id;
}

function normaliseFieldValue(field: string, value: unknown) {
  if (field === "certificate_status" && typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "valid") return "Valid";
    if (lower === "expired") return "Expired";
    if (lower === "missing") return "Missing";
  }

  return value;
}

function datapointForField(field: string) {
  if (field === "supplier_confirmed") return "supplier_confirmation";
  if (field === "certificate_id") return "certificate_status";
  return field;
}

function resolveMissingFields(component: PackagingComponent, event: EvidenceEvent) {
  const fields = Object.keys(event.field_updates);
  const resolved = new Set(fields);

  if (event.document_url || event.document_id || fields.includes("evidence_url")) {
    resolved.add("evidence_url");
  }

  if (event.field_updates.certificate_status === "Valid" || event.field_updates.certificate_status === "valid") {
    resolved.add("valid_certificate");
  }

  if (event.field_updates.material === "HDPE" || event.field_updates.material === "PE-HD") {
    resolved.add("canonical_material");
  }

  if (event.field_updates.supplier_confirmed === true) {
    resolved.add("supplier_confirmation");
    resolved.add("supplier_alias_confirmation");
  }

  return component.missing_fields.filter((field) => !resolved.has(field));
}

function mergeDatapoints(component: PackagingComponent, event: EvidenceEvent) {
  const additions = Object.keys(event.field_updates).map(datapointForField);
  if (event.document_url || event.document_id) additions.push("evidence_url");
  return [...new Set([...component.available_datapoints, ...additions])];
}

function dataQualityLift(event: EvidenceEvent, before: PackagingComponent) {
  const fieldCount = Object.keys(event.field_updates).length;
  const confidenceLift = event.confidence === "high" ? 4 : event.confidence === "medium" ? 2 : 0;
  const evidenceLift = event.document_id ? 2 : 0;
  const missingLift = before.missing_fields.length > 0 ? Math.min(4, before.missing_fields.length) : 0;
  return Math.min(8, confidenceLift + evidenceLift + Math.min(3, fieldCount) + missingLift);
}

function createDocumentFromEvent(event: EvidenceEvent, status: EvidenceDocument["validation_status"]) {
  if (!event.document_id || !event.document_name) return undefined;

  return {
    document_id: event.document_id,
    document_name: event.document_name,
    evidence_type: event.evidence_type,
    linked_product_id: event.product_id,
    linked_component_id: event.component_id,
    linked_supplier_id: event.supplier_id,
    certificate_id: event.certificate_id,
    valid_from: event.valid_from,
    valid_until: event.valid_until,
    issuing_body: event.issuing_body,
    extracted_fields: event.field_updates,
    validation_status: status,
    validation_messages: []
  };
}

function upsertDocument(documents: EvidenceDocument[], document?: EvidenceDocument) {
  if (!document) return documents;

  const exists = documents.some((item) => item.document_id === document.document_id);
  if (!exists) return [document, ...documents];

  return documents.map((item) =>
    item.document_id === document.document_id
      ? {
          ...item,
          ...document,
          validation_messages: [...new Set([...item.validation_messages, ...document.validation_messages])]
        }
      : item
  );
}

function updateEventStatus(events: EvidenceEvent[], eventId: string, status: EvidenceEvent["evidence_status"]) {
  return events.map((event) =>
    event.event_id === eventId
      ? {
          ...event,
          evidence_status: status
        }
      : event
  );
}

function emptyScoreChange(state: EvidenceProcessingState, event: EvidenceEvent, reason: string): ScoreChange {
  const readiness = calculateScoreChange(state, state, event);
  return {
    ...readiness,
    reason
  };
}

export function validateEvidenceEvent(
  event: EvidenceEvent,
  currentState: EvidenceProcessingState
): EvidenceValidationResult {
  return runEvidenceValidation(event, currentState);
}

export function linkEvidenceToComponent(event: EvidenceEvent, component: PackagingComponent) {
  if (!event.component_id || event.component_id !== component.component_id) return component;
  return applyFieldUpdates(component, event);
}

function applyFieldUpdates(component: PackagingComponent, event: EvidenceEvent): PackagingComponent {
  const updates = Object.fromEntries(
    Object.entries(event.field_updates).map(([field, value]) => [field, normaliseFieldValue(field, value)])
  );
  const documentUrl = event.document_url ?? (event.document_id ? `/sample-documents/${event.document_name ?? event.document_id}` : undefined);
  const nextComponent = {
    ...component,
    ...updates,
    evidence_url: documentUrl ?? component.evidence_url,
    certificate_id: (updates.certificate_id as string | null | undefined) ?? event.certificate_id ?? component.certificate_id,
    missing_fields: resolveMissingFields(component, { ...event, field_updates: updates }),
    available_datapoints: mergeDatapoints(component, { ...event, field_updates: updates }),
    last_updated: event.timestamp
  } as PackagingComponent;

  return {
    ...nextComponent,
    data_quality_score: Math.min(100, component.data_quality_score + dataQualityLift(event, component))
  };
}

export function applyEvidenceEvent(
  event: EvidenceEvent,
  currentState: EvidenceProcessingState,
  validationOverride?: EvidenceValidationResult
): EvidenceProcessingResult {
  const validation = validationOverride ?? validateEvidenceEvent(event, currentState);
  if (!validation.canAutoApply) {
    return processWithoutApplying(event, currentState, validation);
  }

  const previousState = clone(currentState);
  const nextComponents = currentState.components.map((component) =>
    event.component_id === component.component_id ? applyFieldUpdates(component, event) : component
  );
  const affectedComponent = event.component_id
    ? nextComponents.find((component) => component.component_id === event.component_id)
    : undefined;
  const componentValidation = affectedComponent ? validateComponent(affectedComponent) : undefined;
  const nextDocument = createDocumentFromEvent(event, "applied");
  const nextStateWithoutAudit: EvidenceProcessingState = {
    ...currentState,
    components: nextComponents,
    evidenceEvents: updateEventStatus(currentState.evidenceEvents, event.event_id, "applied"),
    evidenceDocuments: upsertDocument(currentState.evidenceDocuments, nextDocument)
  };
  const scoreChange = calculateScoreChange(previousState, nextStateWithoutAudit, event);
  const auditEvents = createEvidenceAuditEvents(event, scoreChange, "evidence auto-applied");
  const nextState = {
    ...nextStateWithoutAudit,
    auditEvents: [...auditEvents.reverse(), ...currentState.auditEvents]
  };

  return {
    state: nextState,
    validation,
    scoreChange,
    auditEvents,
    affectedComponent,
    componentValidation
  };
}

function processWithoutApplying(
  event: EvidenceEvent,
  currentState: EvidenceProcessingState,
  validation: EvidenceValidationResult
): EvidenceProcessingResult {
  const status = validation.status;
  const nextDocument = createDocumentFromEvent(event, status);
  const nextStateWithoutAudit: EvidenceProcessingState = {
    ...currentState,
    evidenceEvents: updateEventStatus(currentState.evidenceEvents, event.event_id, status),
    evidenceDocuments: upsertDocument(currentState.evidenceDocuments, nextDocument)
  };
  const scoreChange = emptyScoreChange(
    currentState,
    event,
    status === "needs_review"
      ? "Evidence is pending human review and has not changed readiness."
      : "Evidence was not applied and did not change readiness."
  );
  const action =
    status === "needs_review"
      ? "evidence pending review"
      : status === "expired"
        ? "evidence rejected"
        : "evidence rejected";
  const auditEvents = createEvidenceAuditEvents(event, scoreChange, action);

  return {
    state: {
      ...nextStateWithoutAudit,
      auditEvents: [...auditEvents.reverse(), ...currentState.auditEvents]
    },
    validation,
    scoreChange,
    auditEvents,
    affectedComponent: event.component_id
      ? currentState.components.find((component) => component.component_id === event.component_id)
      : undefined
  };
}

export function processIncomingEvidence(
  event: EvidenceEvent,
  currentState: EvidenceProcessingState
): EvidenceProcessingResult {
  const validation = validateEvidenceEvent(event, currentState);
  return validation.canAutoApply
    ? applyEvidenceEvent(event, currentState)
    : processWithoutApplying(event, currentState, validation);
}

export function approveEvidenceEvent(
  event: EvidenceEvent,
  currentState: EvidenceProcessingState
): EvidenceProcessingResult {
  const originalValidation = validateEvidenceEvent(event, currentState);
  if (originalValidation.status === "expired" || originalValidation.status === "rejected") {
    return processWithoutApplying(event, currentState, originalValidation);
  }

  const approvedEvent = {
    ...event,
    requires_human_review: false,
    confidence: event.confidence === "low" ? "medium" : event.confidence
  } satisfies EvidenceEvent;
  const result = applyEvidenceEvent(approvedEvent, currentState, {
    event_id: event.event_id,
    status: "validated",
    canAutoApply: true,
    compatibleFields: Object.keys(event.field_updates),
    rejectedFields: [],
    checks: [
      {
        id: "human_review",
        label: "Human review",
        status: "pass",
        message: "Evidence was approved by a compliance reviewer."
      }
    ],
    messages: []
  });
  const approvalAudit = createAuditEvent(
    {
      actor: "Compliance reviewer",
      action_type: "evidence approved",
      object_type: "Evidence",
      object_id: event.event_id,
      before_value: event.evidence_status,
      after_value: "applied",
      source: "Evidence intake simulator",
      comment: `Approved ${event.evidence_type} and applied compatible updates.`
    },
    { event_id: `AUD-${event.event_id}-APPROVED`, timestamp: event.timestamp }
  );

  return {
    ...result,
    state: {
      ...result.state,
      auditEvents: [approvalAudit, ...result.state.auditEvents]
    },
    auditEvents: [approvalAudit, ...result.auditEvents]
  };
}

export function rejectEvidenceEvent(
  event: EvidenceEvent,
  currentState: EvidenceProcessingState,
  reason: string
): EvidenceProcessingResult {
  const scoreChange = emptyScoreChange(currentState, event, reason);
  const rejectedAudit = createAuditEvent(
    {
      actor: "Compliance reviewer",
      action_type: "evidence rejected",
      object_type: "Evidence",
      object_id: getEventObjectId(event),
      before_value: event.evidence_status,
      after_value: "rejected",
      source: "Evidence intake simulator",
      comment: reason
    },
    { event_id: `AUD-${event.event_id}-REJECTED`, timestamp: event.timestamp }
  );
  const validation: EvidenceValidationResult = {
    event_id: event.event_id,
    status: "rejected",
    canAutoApply: false,
    compatibleFields: [],
    rejectedFields: [],
    checks: [
      {
        id: "review_rejection",
        label: "Human review",
        status: "fail",
        message: reason
      }
    ],
    messages: [reason]
  };

  return {
    state: {
      ...currentState,
      evidenceEvents: updateEventStatus(currentState.evidenceEvents, event.event_id, "rejected"),
      evidenceDocuments: currentState.evidenceDocuments.map((document) =>
        document.document_id === event.document_id
          ? {
              ...document,
              validation_status: "rejected",
              validation_messages: [...document.validation_messages, reason]
            }
          : document
      ),
      auditEvents: [rejectedAudit, ...currentState.auditEvents]
    },
    validation,
    scoreChange,
    auditEvents: [rejectedAudit],
    affectedComponent: event.component_id
      ? currentState.components.find((component) => component.component_id === event.component_id)
      : undefined
  };
}

export function createEvidenceAuditEvent(event: EvidenceEvent, scoreChange: ScoreChange) {
  return createEvidenceAuditEvents(event, scoreChange, "evidence validated")[0];
}

export function getComponentEvidenceScore(component: PackagingComponent, evidenceDocuments: EvidenceDocument[]) {
  return recalculateComponentScore(component, evidenceDocuments, validateComponent(component));
}
