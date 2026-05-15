import { calculateReadiness } from "./scoring";
import { validateComponent } from "./validation";
import type { EvidenceDocument, EvidenceEvent, EvidenceProcessingState, ScoreChange } from "./evidence-types";
import type { PackagingComponent, Product, ValidationResult } from "./types";

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function hasLinkedEvidence(component: PackagingComponent, documents: EvidenceDocument[]) {
  return documents.some(
    (document) =>
      document.linked_component_id === component.component_id &&
      (document.validation_status === "validated" || document.validation_status === "applied")
  );
}

export function recalculateComponentScore(
  component: PackagingComponent,
  evidenceDocuments: EvidenceDocument[],
  validationResult: ValidationResult = validateComponent(component)
) {
  const completeness = Math.max(0, 100 - component.missing_fields.length * 12);
  const evidence = component.evidence_url || hasLinkedEvidence(component, evidenceDocuments) ? 100 : 0;
  const validation = validationResult.valid
    ? 100
    : Math.max(0, 100 - validationResult.errors.length * 20 - validationResult.warnings.length * 8);
  const supplier = component.supplier_confirmed ? 100 : 35;

  return Math.round(
    average([
      completeness,
      evidence,
      component.data_quality_score,
      validation,
      supplier
    ])
  );
}

export function recalculateOverallReadiness(
  products: Product[],
  components: PackagingComponent[],
  evidenceDocuments: EvidenceDocument[],
  validationResults: ValidationResult[] = components.map((component) => validateComponent(component))
) {
  void products;
  void validationResults;
  return calculateReadiness(components, undefined, evidenceDocuments);
}

export function calculateScoreChange(
  previousState: EvidenceProcessingState,
  newState: EvidenceProcessingState,
  event: EvidenceEvent
): ScoreChange {
  const previousComponent = event.component_id
    ? previousState.components.find((component) => component.component_id === event.component_id)
    : undefined;
  const newComponent = event.component_id
    ? newState.components.find((component) => component.component_id === event.component_id)
    : undefined;

  const previousReadiness = recalculateOverallReadiness(
    previousState.products,
    previousState.components,
    previousState.evidenceDocuments
  );
  const newReadiness = recalculateOverallReadiness(
    newState.products,
    newState.components,
    newState.evidenceDocuments
  );

  const previousComponentScore = previousComponent
    ? recalculateComponentScore(previousComponent, previousState.evidenceDocuments)
    : undefined;
  const newComponentScore = newComponent
    ? recalculateComponentScore(newComponent, newState.evidenceDocuments)
    : undefined;

  return {
    product_id: event.product_id ?? previousState.products[0]?.product_id ?? "unknown",
    component_id: event.component_id,
    previous_component_score: previousComponentScore,
    new_component_score: newComponentScore,
    previous_overall_readiness: previousReadiness.score,
    new_overall_readiness: newReadiness.score,
    delta: newReadiness.score - previousReadiness.score,
    changed_fields: Object.keys(event.field_updates),
    reason: event.impact_summary
  };
}
