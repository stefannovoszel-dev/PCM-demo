import evidenceEventData from "@/data/evidence-events.json";
import evidenceDocumentData from "@/data/evidence-documents.json";
import type { EvidenceDocument, EvidenceEvent, EvidenceStatus, EvidenceType } from "./evidence-types";

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  recycled_content_certificate: "Recycled content certificate",
  supplier_material_declaration: "Supplier material declaration",
  recyclability_test_report: "Recyclability test report",
  material_composition_statement: "Material composition statement",
  substances_declaration: "Substances declaration",
  epr_registration_number: "EPR registration number",
  declaration_of_conformity: "Declaration of conformity",
  packaging_weight_confirmation: "Packaging weight confirmation",
  supplier_change_notification: "Supplier change notification",
  audit_document: "Audit document",
  technical_documentation_file: "Technical documentation file"
};

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  received: "Received",
  validated: "Validated",
  rejected: "Rejected",
  expired: "Expired",
  needs_review: "Needs review",
  applied: "Applied"
};

export const initialEvidenceEvents = evidenceEventData as EvidenceEvent[];
export const initialEvidenceDocuments = evidenceDocumentData as EvidenceDocument[];
