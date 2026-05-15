import type {
  EvidenceEvent,
  EvidenceProcessingState,
  EvidenceStatus,
  EvidenceType,
  EvidenceValidationCheck,
  EvidenceValidationResult
} from "./evidence-types";

export const EVIDENCE_REFERENCE_DATE = new Date("2026-05-15T00:00:00.000Z");

const compatibleFieldsByType: Record<EvidenceType, string[]> = {
  recycled_content_certificate: [
    "recycled_content_percent",
    "certificate_status",
    "certificate_id",
    "evidence_url"
  ],
  supplier_material_declaration: [
    "material",
    "material_aliases",
    "supplier_confirmed",
    "evidence_url",
    "supplier_declaration_status"
  ],
  recyclability_test_report: [
    "recyclability_grade",
    "assessment_method_reference",
    "test_report_id",
    "evidence_url"
  ],
  material_composition_statement: [
    "material",
    "component_list",
    "material_type_per_component",
    "evidence_url"
  ],
  substances_declaration: [
    "substances_of_concern_flag",
    "substances_declaration_status",
    "evidence_url"
  ],
  epr_registration_number: ["pro_registration_numbers", "epr_registration_status"],
  declaration_of_conformity: [
    "eu_declaration_of_conformity_id",
    "conformity_status",
    "evidence_url"
  ],
  packaging_weight_confirmation: ["weight_g"],
  supplier_change_notification: [
    "recycled_content_percent",
    "recyclability_grade",
    "certificate_status",
    "certificate_id",
    "material",
    "material_aliases",
    "weight_g",
    "supplier_confirmed",
    "evidence_url"
  ],
  audit_document: ["chain_of_custody_document", "secondary_evidence_review", "evidence_url"],
  technical_documentation_file: [
    "technical_documentation_status",
    "technical_documentation_id",
    "evidence_url"
  ]
};

function check(
  id: string,
  label: string,
  status: EvidenceValidationCheck["status"],
  message: string
): EvidenceValidationCheck {
  return { id, label, status, message };
}

function hasRequiredLinkage(event: EvidenceEvent) {
  return Boolean(event.product_id || event.packaging_id || event.component_id || event.supplier_id);
}

function isExpired(event: EvidenceEvent, referenceDate = EVIDENCE_REFERENCE_DATE) {
  return event.valid_until ? new Date(`${event.valid_until}T23:59:59.999Z`) < referenceDate : false;
}

function changesExistingValidatedValue(event: EvidenceEvent, state: EvidenceProcessingState) {
  if (event.evidence_type !== "supplier_change_notification" || !event.component_id) {
    return false;
  }

  const component = state.components.find((item) => item.component_id === event.component_id);
  if (!component) {
    return false;
  }

  return Object.entries(event.field_updates).some(([field, value]) => {
    const currentValue = (component as unknown as Record<string, unknown>)[field];
    return currentValue !== null && currentValue !== undefined && currentValue !== value;
  });
}

export function getCompatibleEvidenceFields(type: EvidenceType) {
  return compatibleFieldsByType[type];
}

export function validateEvidenceEvent(
  event: EvidenceEvent,
  state: EvidenceProcessingState,
  referenceDate = EVIDENCE_REFERENCE_DATE
): EvidenceValidationResult {
  const checks: EvidenceValidationCheck[] = [];
  const compatibleFields = compatibleFieldsByType[event.evidence_type];
  const updateFields = Object.keys(event.field_updates);
  const rejectedFields = updateFields.filter((field) => !compatibleFields.includes(field));
  const expired = isExpired(event, referenceDate);
  const requiresReview =
    event.requires_human_review || event.confidence === "low" || changesExistingValidatedValue(event, state);

  checks.push(
    hasRequiredLinkage(event)
      ? check("linkage", "Required linkage", "pass", "Evidence references at least one product, packaging, component or supplier.")
      : check("linkage", "Required linkage", "fail", "Evidence must reference a product, packaging, component or supplier.")
  );

  checks.push(
    expired
      ? check("certificate_validity", "Certificate validity", "fail", "Validity date is in the past; evidence cannot be auto-applied.")
      : check("certificate_validity", "Certificate validity", "pass", "No expired validity period was detected.")
  );

  checks.push(
    rejectedFields.length
      ? check(
          "field_compatibility",
          "Evidence-to-field compatibility",
          "fail",
          `Unsupported field update(s): ${rejectedFields.join(", ")}.`
        )
      : check(
          "field_compatibility",
          "Evidence-to-field compatibility",
          "pass",
          "All field updates match the evidence type."
        )
  );

  checks.push(
    event.confidence === "low"
      ? check("confidence", "Confidence", "warning", "Low-confidence evidence requires review.")
      : check("confidence", "Confidence", "pass", `${event.confidence} confidence evidence can continue.`)
  );

  checks.push(
    requiresReview
      ? check("human_review", "Human review requirement", "warning", "Evidence requires human review before application.")
      : check("human_review", "Human review requirement", "pass", "No human review requirement was triggered.")
  );

  let status: EvidenceStatus = "validated";
  if (!hasRequiredLinkage(event) || rejectedFields.length > 0) {
    status = "rejected";
  } else if (expired) {
    status = "expired";
  } else if (requiresReview) {
    status = "needs_review";
  }

  return {
    event_id: event.event_id,
    status,
    canAutoApply: status === "validated",
    compatibleFields,
    rejectedFields,
    checks,
    messages: checks
      .filter((item) => item.status !== "pass")
      .map((item) => item.message)
  };
}
