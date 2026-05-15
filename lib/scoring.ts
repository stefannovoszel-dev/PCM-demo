import { PPWR_REQUIRED_DATAPOINTS } from "./constants";
import type { EvidenceDocument } from "./evidence-types";
import type { PackagingComponent } from "./types";
import { validateComponent } from "./validation";

export interface ReadinessBreakdown {
  score: number;
  datapointCompleteness: number;
  evidenceAvailability: number;
  dataQualityScore: number;
  validationPassRate: number;
  supplierConfirmationRate: number;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function evidenceScore(component: PackagingComponent, evidenceDocuments: EvidenceDocument[] = []) {
  const hasLinkedEvidence = evidenceDocuments.some(
    (document) =>
      document.linked_component_id === component.component_id &&
      (document.validation_status === "validated" || document.validation_status === "applied")
  );

  if (hasLinkedEvidence) return 100;
  if (component.evidence_url && component.certificate_status === "Valid") return 100;
  if (component.evidence_url) return 50;
  return 0;
}

export function calculateReadiness(
  components: PackagingComponent[],
  requiredDatapoints = PPWR_REQUIRED_DATAPOINTS,
  evidenceDocuments: EvidenceDocument[] = []
): ReadinessBreakdown {
  const totalDatapoints = components.length * requiredDatapoints.length;
  const missingDatapoints = components.reduce(
    (sum, component) => sum + component.missing_fields.length,
    0
  );
  const datapointCompleteness = totalDatapoints
    ? Math.max(0, ((totalDatapoints - missingDatapoints) / totalDatapoints) * 100)
    : 0;

  const evidenceAvailability = average(components.map((component) => evidenceScore(component, evidenceDocuments)));
  const dataQualityScore = average(components.map((component) => component.data_quality_score));
  const validationPassRate =
    (components.filter((component) => validateComponent(component, requiredDatapoints).valid).length /
      Math.max(components.length, 1)) *
    100;
  const supplierConfirmationRate =
    (components.filter((component) => component.supplier_confirmed).length /
      Math.max(components.length, 1)) *
    100;

  const score =
    datapointCompleteness * 0.35 +
    evidenceAvailability * 0.25 +
    dataQualityScore * 0.2 +
    validationPassRate * 0.15 +
    supplierConfirmationRate * 0.05;

  return {
    score: Math.round(score),
    datapointCompleteness: Math.round(datapointCompleteness),
    evidenceAvailability: Math.round(evidenceAvailability),
    dataQualityScore: Math.round(dataQualityScore),
    validationPassRate: Math.round(validationPassRate),
    supplierConfirmationRate: Math.round(supplierConfirmationRate)
  };
}
