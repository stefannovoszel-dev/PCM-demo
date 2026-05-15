import { describe, expect, it } from "vitest";
import auditEvents from "../data/audit-events.json";
import components from "../data/packaging-components.json";
import evidenceDocuments from "../data/evidence-documents.json";
import evidenceEvents from "../data/evidence-events.json";
import products from "../data/products.json";
import { processIncomingEvidence } from "../lib/evidence-engine";
import type { EvidenceDocument, EvidenceEvent, EvidenceProcessingState } from "../lib/evidence-types";
import { calculateReadiness } from "../lib/scoring";
import type { AuditEvent, PackagingComponent, Product } from "../lib/types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function makeState(): EvidenceProcessingState {
  return {
    products: clone(products as Product[]),
    components: clone(components as PackagingComponent[]),
    evidenceEvents: clone(evidenceEvents as EvidenceEvent[]),
    evidenceDocuments: clone(evidenceDocuments as EvidenceDocument[]),
    auditEvents: clone(auditEvents as AuditEvent[])
  };
}

function runAllEvidence() {
  let state = makeState();
  for (const event of state.evidenceEvents.filter((item) => item.evidence_status === "received")) {
    const result = processIncomingEvidence(event, state);
    state = result.state;
  }
  return state;
}

describe("score recalculation", () => {
  it("recalculates component and overall readiness after evidence application", () => {
    const state = makeState();
    const event = state.evidenceEvents.find((item) => item.event_id === "EV-001");
    if (!event) throw new Error("Missing EV-001");

    const result = processIncomingEvidence(event, state);

    expect(result.scoreChange.new_component_score).toBeGreaterThan(result.scoreChange.previous_component_score ?? 0);
    expect(result.scoreChange.new_overall_readiness).toBeGreaterThanOrEqual(result.scoreChange.previous_overall_readiness);
  });

  it("processing all evidence events improves readiness from the initial demo range to the target range", () => {
    const initial = makeState();
    const before = calculateReadiness(initial.components, undefined, initial.evidenceDocuments);
    const afterState = runAllEvidence();
    const after = calculateReadiness(afterState.components, undefined, afterState.evidenceDocuments);

    expect(before.score).toBeGreaterThanOrEqual(60);
    expect(before.score).toBeLessThanOrEqual(66);
    expect(after.score).toBeGreaterThanOrEqual(89);
    expect(after.score).toBeLessThanOrEqual(95);
  });
});
