import { describe, expect, it } from "vitest";
import auditEvents from "../data/audit-events.json";
import components from "../data/packaging-components.json";
import evidenceDocuments from "../data/evidence-documents.json";
import evidenceEvents from "../data/evidence-events.json";
import products from "../data/products.json";
import {
  processIncomingEvidence,
  rejectEvidenceEvent
} from "../lib/evidence-engine";
import type { EvidenceDocument, EvidenceEvent, EvidenceProcessingState } from "../lib/evidence-types";
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

function event(id: string) {
  const found = (evidenceEvents as EvidenceEvent[]).find((item) => item.event_id === id);
  if (!found) throw new Error(`Missing evidence event ${id}`);
  return clone(found);
}

describe("evidence engine", () => {
  it("auto-applies a valid evidence event", () => {
    const result = processIncomingEvidence(event("EV-001"), makeState());

    expect(result.validation.canAutoApply).toBe(true);
    expect(result.state.evidenceEvents.find((item) => item.event_id === "EV-001")?.evidence_status).toBe("applied");
    expect(result.auditEvents.some((audit) => audit.action_type === "evidence auto-applied")).toBe(true);
  });

  it("applies recycled content certificate updates to component fields", () => {
    const result = processIncomingEvidence(event("EV-001"), makeState());
    const component = result.state.components.find((item) => item.component_id === "CMP-1002");

    expect(component?.certificate_status).toBe("Valid");
    expect(component?.certificate_id).toBe("CERT-RC-2026-044");
    expect(component?.evidence_url).toBe("/sample-documents/recycled-content-certificate.pdf");
  });

  it("creates audit events when evidence is applied", () => {
    const result = processIncomingEvidence(event("EV-001"), makeState());

    expect(result.state.auditEvents.some((audit) => audit.action_type === "evidence received")).toBe(true);
    expect(result.state.auditEvents.some((audit) => audit.action_type === "compliance score recalculated")).toBe(true);
  });

  it("rejecting evidence does not change compliance score", () => {
    const result = rejectEvidenceEvent(event("EV-001"), makeState(), "Bad file.");

    expect(result.scoreChange.delta).toBe(0);
    expect(result.state.evidenceEvents.find((item) => item.event_id === "EV-001")?.evidence_status).toBe("rejected");
  });
});
