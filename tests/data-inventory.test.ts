import { describe, expect, it } from "vitest";
import auditEvents from "../data/audit-events.json";
import baseInventory from "../data/data-inventory.json";
import components from "../data/packaging-components.json";
import evidenceDocuments from "../data/evidence-documents.json";
import evidenceEvents from "../data/evidence-events.json";
import products from "../data/products.json";
import { deriveDataInventoryRecords } from "../lib/data-inventory";
import { processIncomingEvidence } from "../lib/evidence-engine";
import type { EvidenceDocument, EvidenceEvent, EvidenceProcessingState } from "../lib/evidence-types";
import type { AuditEvent, DataInventoryRecord, PackagingComponent, Product } from "../lib/types";

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

function getRecord(records: DataInventoryRecord[], datapoint: string) {
  const record = records.find((item) => item.datapoint === datapoint);
  if (!record) throw new Error(`Missing inventory datapoint ${datapoint}`);
  return record;
}

describe("dynamic data inventory", () => {
  it("reflects evidence intake changes in inventory status and scores", () => {
    const initial = makeState();
    const initialRecords = deriveDataInventoryRecords(
      baseInventory as DataInventoryRecord[],
      initial.components,
      initial.evidenceDocuments,
      initial.auditEvents
    );

    const capCertificate = initial.evidenceEvents.find((event) => event.event_id === "EV-001");
    if (!capCertificate) throw new Error("Missing EV-001");
    const updated = processIncomingEvidence(capCertificate, initial).state;

    const updatedRecords = deriveDataInventoryRecords(
      baseInventory as DataInventoryRecord[],
      updated.components,
      updated.evidenceDocuments,
      updated.auditEvents
    );

    const initialCertificate = getRecord(initialRecords, "Certificate status");
    const updatedCertificate = getRecord(updatedRecords, "Certificate status");
    const updatedEvidenceLink = getRecord(updatedRecords, "Evidence document link");

    expect(updatedCertificate.completeness_rating).toBeGreaterThan(initialCertificate.completeness_rating);
    expect(updatedCertificate.dq_score).toBeGreaterThan(initialCertificate.dq_score);
    expect(updatedEvidenceLink.notes).toMatch(/applied linked evidence/i);
  });
});
