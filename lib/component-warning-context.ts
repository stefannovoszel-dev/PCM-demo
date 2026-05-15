import dataInventory from "../data/data-inventory.json";
import { getMissingEvidenceLabels } from "./validation";
import type { EvidenceDocument } from "./evidence-types";
import type { DataInventoryRecord, PackagingComponent } from "./types";

export interface ComponentWarningContext {
  fieldKey: string;
  label: string;
  status: "missing" | "expired" | "review";
  missing: string;
  legalContext: string;
  requiredEvidence: string[];
  recommendedAction: string;
  dataOwner?: string;
  sourceSystem?: string;
  legalReference?: string;
}

const inventoryRecords = dataInventory as DataInventoryRecord[];

const inventoryByWarningKey: Record<string, string> = {
  canonical_material: "Canonical material",
  material: "Canonical material",
  recycled_content_percent: "Recycled content percent",
  recyclability_grade: "Recyclability grade",
  certificate_id: "Certificate status",
  certificate_status: "Certificate status",
  valid_certificate: "Certificate status",
  evidence_url: "Evidence document link",
  supplier_confirmation: "Supplier confirmation",
  supplier_alias_confirmation: "Component aliases",
  chain_of_custody_document: "Evidence document link",
  secondary_evidence_review: "Evidence document link"
};

const warningCopy: Record<
  string,
  {
    label: string;
    missing: (component: PackagingComponent) => string;
    requiredEvidence: string[];
    recommendedAction: string;
  }
> = {
  canonical_material: {
    label: "Canonical material mapping",
    missing: (component) => `${component.material} needs confirmation against the canonical material taxonomy.`,
    requiredEvidence: ["Canonical material value", "Alias mapping rationale", "Supplier or material-master confirmation"],
    recommendedAction: "Map the material to the accepted taxonomy and retain the alias mapping for audit traceability."
  },
  recycled_content_percent: {
    label: "Recycled content percentage",
    missing: () => "The recycled content percentage is missing or not substantiated for this component.",
    requiredEvidence: ["Supplier material declaration", "Recycled content certificate", "Certificate validity metadata"],
    recommendedAction: "Request a supplier declaration or certificate and apply it through Evidence Intake."
  },
  recyclability_grade: {
    label: "Recyclability grade",
    missing: () => "No recyclability grade is available for this component.",
    requiredEvidence: ["Recyclability test report", "Assessment method reference", "Grade or classification result"],
    recommendedAction: "Link a recyclability assessment or upload a test report for this packaging component."
  },
  certificate_id: {
    label: "Certificate identifier",
    missing: () => "The supporting certificate identifier is missing.",
    requiredEvidence: ["Certificate ID", "Issuing body", "Valid-from and valid-until dates", "Linked certificate file"],
    recommendedAction: "Capture the certificate metadata and link the source document."
  },
  valid_certificate: {
    label: "Valid certificate",
    missing: (component) => `The current certificate status is ${component.certificate_status.toLowerCase()}, so the claim is not backed by a valid certificate.`,
    requiredEvidence: ["Current certificate", "Validity dates", "Issuing body", "Claim-to-component link"],
    recommendedAction: "Replace the expired or missing certificate before treating the claim as readiness-complete."
  },
  certificate_status: {
    label: "Certificate status",
    missing: (component) => `The certificate status is ${component.certificate_status.toLowerCase()} and needs review.`,
    requiredEvidence: ["Validated certificate status", "Expiry check", "Document metadata"],
    recommendedAction: "Validate the certificate status against the underlying document metadata."
  },
  evidence_url: {
    label: "Evidence document link",
    missing: () => "No traceable evidence document is linked to this component.",
    requiredEvidence: ["Document link", "Document ID", "Document type", "Component-to-document relationship"],
    recommendedAction: "Attach or approve evidence so the component has an auditable document trail."
  },
  supplier_confirmation: {
    label: "Supplier confirmation",
    missing: () => "The supplier has not confirmed that the component data is correct.",
    requiredEvidence: ["Supplier confirmation timestamp", "Supplier identity", "Confirmed field set"],
    recommendedAction: "Ask the supplier to confirm the component record or approve a supplier event that provides confirmation."
  },
  supplier_alias_confirmation: {
    label: "Supplier alias confirmation",
    missing: () => "The supplier has not confirmed that the alias maps to the canonical component record.",
    requiredEvidence: ["Alias mapping", "Supplier confirmation", "Canonical component name"],
    recommendedAction: "Confirm the alias mapping so duplicate component records can be reconciled."
  },
  chain_of_custody_document: {
    label: "Chain-of-custody document",
    missing: () => "Additional chain-of-custody evidence is missing for this evidence set.",
    requiredEvidence: ["Chain-of-custody file", "Material batch or certificate linkage", "Supplier declaration"],
    recommendedAction: "Collect the chain-of-custody document where the claim depends on upstream traceability."
  },
  secondary_evidence_review: {
    label: "Secondary evidence review",
    missing: () => "A second review of the linked evidence is still open.",
    requiredEvidence: ["Reviewer decision", "Review timestamp", "Reviewed document reference"],
    recommendedAction: "Complete a secondary compliance review and store the decision in the audit trail."
  }
};

function getInventoryRecord(fieldKey: string) {
  const datapoint = inventoryByWarningKey[fieldKey];
  return inventoryRecords.find((record) => record.datapoint === datapoint);
}

function getFallbackCopy(fieldKey: string) {
  const label = fieldKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    label,
    missing: () => `${label} is missing or requires review for this component.`,
    requiredEvidence: ["Supporting evidence", "Source system value", "Audit-ready owner confirmation"],
    recommendedAction: "Confirm the source data and attach evidence before marking the datapoint complete."
  };
}

export function getComponentWarningContext(
  component: PackagingComponent,
  fieldKey: string
): ComponentWarningContext {
  const copy = warningCopy[fieldKey] ?? getFallbackCopy(fieldKey);
  const inventoryRecord = getInventoryRecord(fieldKey);
  const status =
    fieldKey === "valid_certificate" || component.certificate_status === "Expired"
      ? "expired"
      : fieldKey.includes("review")
        ? "review"
        : "missing";
  const legalReference = inventoryRecord?.legal_reference ?? "PPWR evidence and reporting readiness";

  return {
    fieldKey,
    label: copy.label,
    status,
    missing: copy.missing(component),
    legalContext: `Demo PPWR context: ${legalReference}. This datapoint supports component-level substantiation, readiness scoring, and auditability. Final legal relevance depends on the company's role, Member State setup, contractual flow, and legal review.`,
    requiredEvidence: copy.requiredEvidence,
    recommendedAction: copy.recommendedAction,
    dataOwner: inventoryRecord?.data_owner,
    sourceSystem: inventoryRecord?.primary_source_system,
    legalReference
  };
}

export function getComponentWarningContexts(
  component: PackagingComponent,
  evidenceDocuments: EvidenceDocument[] = []
) {
  const fieldKeys = new Set(getMissingEvidenceLabels(component, evidenceDocuments));

  if (component.certificate_status === "Missing" || component.certificate_status === "Expired") {
    fieldKeys.add(component.certificate_status === "Expired" ? "valid_certificate" : "certificate_status");
  }

  if (!component.certificate_id && component.certificate_status !== "Not Required") {
    fieldKeys.add("certificate_id");
  }

  if (component.recycled_content_percent === null) fieldKeys.add("recycled_content_percent");
  if (!component.recyclability_grade) fieldKeys.add("recyclability_grade");
  if (!component.supplier_confirmed) fieldKeys.add("supplier_confirmation");

  return Array.from(fieldKeys).map((fieldKey) => getComponentWarningContext(component, fieldKey));
}
