import type { AuditEvent, PackagingComponent, Product, ValidationResult } from "./types";

export type EvidenceType =
  | "recycled_content_certificate"
  | "supplier_material_declaration"
  | "recyclability_test_report"
  | "material_composition_statement"
  | "substances_declaration"
  | "epr_registration_number"
  | "declaration_of_conformity"
  | "packaging_weight_confirmation"
  | "supplier_change_notification"
  | "audit_document"
  | "technical_documentation_file";

export type EvidenceStatus =
  | "received"
  | "validated"
  | "rejected"
  | "expired"
  | "needs_review"
  | "applied";

export type EvidenceSource =
  | "supplier_portal"
  | "osapiens_mock"
  | "manual_upload"
  | "erp"
  | "plm"
  | "document_management"
  | "email";

export interface EvidenceEvent {
  event_id: string;
  timestamp: string;
  source: EvidenceSource;
  supplier_id?: string;
  supplier_name?: string;
  product_id?: string;
  packaging_id?: string;
  component_id?: string;
  evidence_type: EvidenceType;
  evidence_status: EvidenceStatus;
  document_id?: string;
  document_name?: string;
  document_url?: string;
  certificate_id?: string;
  valid_from?: string;
  valid_until?: string;
  issuing_body?: string;
  field_updates: Record<string, unknown>;
  confidence: "high" | "medium" | "low";
  impact_summary: string;
  requires_human_review: boolean;
}

export interface EvidenceDocument {
  document_id: string;
  document_name: string;
  evidence_type: EvidenceType;
  linked_product_id?: string;
  linked_component_id?: string;
  linked_supplier_id?: string;
  certificate_id?: string;
  valid_from?: string;
  valid_until?: string;
  issuing_body?: string;
  extracted_fields: Record<string, unknown>;
  validation_status: EvidenceStatus;
  validation_messages: string[];
}

export interface ScoreChange {
  product_id: string;
  component_id?: string;
  previous_component_score?: number;
  new_component_score?: number;
  previous_overall_readiness: number;
  new_overall_readiness: number;
  delta: number;
  changed_fields: string[];
  reason: string;
}

export interface EvidenceValidationCheck {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  message: string;
}

export interface EvidenceValidationResult {
  event_id: string;
  status: EvidenceStatus;
  canAutoApply: boolean;
  compatibleFields: string[];
  rejectedFields: string[];
  checks: EvidenceValidationCheck[];
  messages: string[];
}

export interface EvidenceProcessingState {
  products: Product[];
  components: PackagingComponent[];
  evidenceEvents: EvidenceEvent[];
  evidenceDocuments: EvidenceDocument[];
  auditEvents: AuditEvent[];
}

export interface EvidenceProcessingResult {
  state: EvidenceProcessingState;
  validation: EvidenceValidationResult;
  scoreChange: ScoreChange;
  auditEvents: AuditEvent[];
  affectedComponent?: PackagingComponent;
  componentValidation?: ValidationResult;
}
