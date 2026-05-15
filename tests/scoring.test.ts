import { describe, expect, it } from "vitest";
import auditEvents from "../data/audit-events.json";
import components from "../data/packaging-components.json";
import evidenceDocuments from "../data/evidence-documents.json";
import evidenceEvents from "../data/evidence-events.json";
import products from "../data/products.json";
import { processIncomingEvidence } from "../lib/evidence-engine";
import { calculateReadiness } from "../lib/scoring";
import type { EvidenceDocument, EvidenceEvent, EvidenceProcessingState } from "../lib/evidence-types";
import type { AuditEvent, PackagingComponent, Product } from "../lib/types";

describe("readiness scoring", () => {
  it("calculates initial readiness around the intended demo range", () => {
    const readiness = calculateReadiness(components as unknown as PackagingComponent[]);
    expect(readiness.score).toBeGreaterThanOrEqual(58);
    expect(readiness.score).toBeLessThanOrEqual(66);
  });

  it("improves after evidence intake processing", () => {
    const state: EvidenceProcessingState = {
      products: JSON.parse(JSON.stringify(products)) as Product[],
      components: JSON.parse(JSON.stringify(components)) as PackagingComponent[],
      evidenceEvents: JSON.parse(JSON.stringify(evidenceEvents)) as EvidenceEvent[],
      evidenceDocuments: JSON.parse(JSON.stringify(evidenceDocuments)) as EvidenceDocument[],
      auditEvents: JSON.parse(JSON.stringify(auditEvents)) as AuditEvent[]
    };
    const initial = calculateReadiness(state.components, undefined, state.evidenceDocuments);
    const updatedState = state.evidenceEvents.reduce(
      (current, event) => processIncomingEvidence(event, current).state,
      state
    );
    const improved = calculateReadiness(updatedState.components, undefined, updatedState.evidenceDocuments);

    expect(improved.score).toBeGreaterThan(initial.score);
    expect(improved.score).toBeGreaterThanOrEqual(89);
  });
});
