import type { AuditEvent } from "./types";
import type { EvidenceEvent, ScoreChange } from "./evidence-types";

interface AuditEventInput {
  actor: string;
  action_type: string;
  object_type: string;
  object_id: string;
  before_value?: unknown;
  after_value?: unknown;
  source: string;
  comment: string;
}

export function createAuditEvent(
  input: AuditEventInput,
  options: { event_id?: string; timestamp?: string } = {}
): AuditEvent {
  return {
    event_id: options.event_id ?? `AUD-${Date.now()}`,
    timestamp: options.timestamp ?? new Date().toISOString(),
    actor: input.actor,
    action_type: input.action_type,
    object_type: input.object_type,
    object_id: input.object_id,
    before_value: input.before_value ?? null,
    after_value: input.after_value ?? null,
    source: input.source,
    comment: input.comment
  };
}

export function appendAuditEvent(events: AuditEvent[], event: AuditEvent) {
  return [event, ...events];
}

export function formatAuditEvent(event: AuditEvent) {
  return `${event.timestamp} | ${event.actor} | ${event.action_type} | ${event.object_type}:${event.object_id}`;
}

export function createEvidenceAuditEvents(
  event: EvidenceEvent,
  scoreChange: ScoreChange,
  statusAction: string
) {
  const objectId = event.component_id ?? event.packaging_id ?? event.product_id ?? event.supplier_id ?? event.event_id;
  const base = {
    actor: event.supplier_name ?? event.source,
    object_type: event.component_id ? "Component" : "Evidence",
    object_id: objectId,
    source: "Evidence intake simulator"
  };

  const timestamp = event.timestamp;
  const received = createAuditEvent(
    {
      ...base,
      action_type: "evidence received",
      before_value: null,
      after_value: event,
      comment: `${event.evidence_type}: ${event.impact_summary}`
    },
    { event_id: `AUD-${event.event_id}-RECEIVED`, timestamp }
  );

  const status = createAuditEvent(
    {
      ...base,
      action_type: statusAction,
      before_value: event.evidence_status,
      after_value: statusAction,
      comment: `Evidence ${event.event_id} processed with ${scoreChange.delta >= 0 ? "+" : ""}${scoreChange.delta} readiness point delta.`
    },
    { event_id: `AUD-${event.event_id}-STATUS`, timestamp }
  );

  const recalculated = createAuditEvent(
    {
      actor: "System",
      action_type: "compliance score recalculated",
      object_type: "Packaging dataset",
      object_id: event.packaging_id ?? scoreChange.product_id,
      before_value: scoreChange.previous_overall_readiness,
      after_value: scoreChange.new_overall_readiness,
      source: "Evidence intake simulator",
      comment: scoreChange.reason
    },
    { event_id: `AUD-${event.event_id}-SCORE`, timestamp }
  );

  return [received, status, recalculated];
}
