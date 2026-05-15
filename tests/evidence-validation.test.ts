import { describe, expect, it } from "vitest";
import auditEvents from "../data/audit-events.json";
import components from "../data/packaging-components.json";
import evidenceDocuments from "../data/evidence-documents.json";
import evidenceEvents from "../data/evidence-events.json";
import products from "../data/products.json";
import { validateEvidenceEvent } from "../lib/evidence-validation";
import type { EvidenceDocument, EvidenceEvent, EvidenceProcessingState } from "../lib/evidence-types";
import type { AuditEvent, PackagingComponent, Product } from "../lib/types";

const state: EvidenceProcessingState = {
  products: products as Product[],
  components: components as PackagingComponent[],
  evidenceEvents: evidenceEvents as EvidenceEvent[],
  evidenceDocuments: evidenceDocuments as EvidenceDocument[],
  auditEvents: auditEvents as AuditEvent[]
};

function event(id: string) {
  const found = (evidenceEvents as EvidenceEvent[]).find((item) => item.event_id === id);
  if (!found) throw new Error(`Missing evidence event ${id}`);
  return found;
}

describe("evidence validation", () => {
  it("marks expired certificates as expired", () => {
    const validation = validateEvidenceEvent(event("EV-010"), state);

    expect(validation.status).toBe("expired");
    expect(validation.canAutoApply).toBe(false);
  });

  it("marks low-confidence evidence as needs_review", () => {
    const validation = validateEvidenceEvent(event("EV-009"), state);

    expect(validation.status).toBe("needs_review");
    expect(validation.canAutoApply).toBe(false);
  });

  it("requires human review for supplier change notifications changing existing values", () => {
    const validation = validateEvidenceEvent(event("EV-002"), state);

    expect(validation.status).toBe("needs_review");
    expect(validation.checks.find((check) => check.id === "human_review")?.status).toBe("warning");
  });
});
