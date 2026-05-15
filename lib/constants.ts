import type { SourceSystem } from "./types";

export const APP_NAME = "Product Compliance Management Demo";

export const REGULATIONS = [
  { id: "PPWR", name: "Packaging and Packaging Waste Regulation", status: "Active" },
  { id: "ESPR", name: "Ecodesign for Sustainable Products Regulation", status: "Coming soon" },
  { id: "EUDR", name: "EU Deforestation Regulation", status: "Coming soon" },
  { id: "CPR", name: "Construction Products Regulation", status: "Coming soon" }
] as const;

export const CANONICAL_MATERIALS = [
  "PET",
  "Recycled PET",
  "HDPE",
  "LDPE",
  "Corrugated Board"
];

export const PPWR_REQUIRED_DATAPOINTS = [
  "component_name",
  "material",
  "weight_g",
  "supplier_id",
  "recycled_content_percent",
  "recyclability_grade",
  "certificate_status",
  "evidence_url",
  "market_country",
  "supplier_confirmation"
];

export const SOURCE_SYSTEMS: SourceSystem[] = [
  "ERP",
  "PLM",
  "Supplier Portal",
  "Excel / Legacy Files",
  "Document Management",
  "Quality Management System",
  "Procurement"
];

export const NAV_ITEMS = [
  { href: "/", label: "Landing" },
  { href: "/scenario", label: "Scenario" },
  { href: "/ppwr-role-identifier", label: "PPWR Role Identifier" },
  { href: "/dashboard", label: "Readiness" },
  { href: "/evidence-intake", label: "Evidence Intake" },
  { href: "/product-explorer", label: "Product Explorer" },
  { href: "/data-discovery", label: "Discovery Map" },
  { href: "/data-inventory", label: "Data Inventory" },
  { href: "/etl-pipeline", label: "ETL Pipeline" },
  { href: "/ai-matching", label: "AI Matching" },
  { href: "/osapiens-payload", label: "Payload" },
  { href: "/audit-trail", label: "Audit Trail" }
];
