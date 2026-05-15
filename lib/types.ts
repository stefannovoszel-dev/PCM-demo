export type Regulation = "PPWR" | "ESPR" | "EUDR" | "CPR";

export type SourceSystem =
  | "ERP"
  | "PLM"
  | "Supplier Portal"
  | "Excel / Legacy Files"
  | "Document Management"
  | "Quality Management System"
  | "Procurement"
  | "Compliance Data Platform"
  | "osapiens Hub"
  | "Reporting / Audit Output";

export interface Product {
  product_id: string;
  product_name: string;
  product_family: string;
  regulation: Regulation;
  market_country: string;
  packaging_id: string;
  lifecycle_status: string;
  owner: string;
}

export interface PackagingComponent {
  component_id: string;
  packaging_id: string;
  component_name: string;
  canonical_component_name?: string;
  aliases: string[];
  material: string;
  material_aliases: string[];
  weight_g: number;
  dimensions?: {
    diameter_mm?: number;
    height_mm?: number;
    width_mm?: number;
    length_mm?: number;
    thickness_um?: number;
  };
  supplier_id: string;
  supplier_name: string;
  recycled_content_percent: number | null;
  recyclability_grade: string | null;
  certificate_status: "Valid" | "Expired" | "Missing" | "Not Required";
  certificate_id: string | null;
  evidence_url: string | null;
  data_quality_score: number;
  missing_fields: string[];
  market_country: string;
  available_datapoints: string[];
  supplier_confirmed: boolean;
  last_updated: string;
}

export interface TransformationExample {
  id: string;
  field: string;
  source_value: string;
  transformed_value: string;
  rule: string;
  source_system: SourceSystem;
}

export interface AiMatchCandidate {
  id: string;
  candidate_a: Partial<PackagingComponent> & {
    component_id?: string;
    component_name: string;
  };
  candidate_b: Partial<PackagingComponent> & {
    harmonised_row_id?: string;
    ERP_record_id?: string;
    PLM_record_id?: string;
    SUP_REC_record_id?: string;
    component_id?: string;
    component_name: string;
  };
  confidence: number;
  reason: string;
  suggested_canonical_name: string;
  status:
    | "Suggested"
    | "Accepted"
    | "Rejected"
    | "Alias Created"
    | "Supplier Confirmation Requested";
  recommended_action: string;
}

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  actor: string;
  action_type: string;
  object_type: string;
  object_id: string;
  before_value: unknown;
  after_value: unknown;
  source: string;
  comment: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  recommended_actions: string[];
}

export interface DataInventoryRecord {
  record_id: string;
  data_domain: string;
  datapoint: string;
  definition: string;
  legal_reference: string;
  required: boolean;
  granularity: string;
  role_steward: string;
  primary_source_system: SourceSystem;
  source_object: string;
  system_owner: string;
  data_owner: string;
  upstream_interface_type: string;
  downstream_interface_type: string;
  refresh_frequency: string;
  access_level: string;
  completeness_rating: number;
  accuracy_rating: number;
  traceability_rating: number;
  dq_score: number;
  dq_checks: string[];
  evidence_link: string | null;
  status: "Complete" | "Review" | "Missing" | "Draft";
  notes: string;
}
