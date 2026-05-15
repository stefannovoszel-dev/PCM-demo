import { CANONICAL_MATERIALS } from "./constants";
import type { EvidenceDocument } from "./evidence-types";
import type { AuditEvent, DataInventoryRecord, PackagingComponent } from "./types";

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function percent(count: number, total: number) {
  return total ? Math.round((count / total) * 100) : 0;
}

function toStatus(completeness: number): DataInventoryRecord["status"] {
  if (completeness >= 90) return "Complete";
  if (completeness >= 55) return "Review";
  return "Missing";
}

function hasAppliedLinkedEvidence(component: PackagingComponent, evidenceDocuments: EvidenceDocument[]) {
  return evidenceDocuments.some(
    (document) =>
      document.linked_component_id === component.component_id &&
      (document.validation_status === "applied" || document.validation_status === "validated")
  );
}

function bestEvidenceLink(components: PackagingComponent[], fallback: string | null) {
  return components.find((component) => component.evidence_url)?.evidence_url ?? fallback;
}

function deriveMetrics(
  datapoint: string,
  components: PackagingComponent[],
  evidenceDocuments: EvidenceDocument[],
  auditEvents: AuditEvent[]
) {
  const total = Math.max(components.length, 1);

  switch (datapoint) {
    case "Component name": {
      const complete = components.filter((component) => Boolean(component.component_name)).length;
      return {
        completeness: percent(complete, total),
        accuracy: Math.round(average(components.map((component) => component.component_name ? component.data_quality_score : 0))),
        traceability: 88,
        evidenceLink: null,
        note: `${complete}/${total} components have names in the live packaging state.`
      };
    }
    case "Canonical material": {
      const complete = components.filter((component) => CANONICAL_MATERIALS.includes(component.material)).length;
      return {
        completeness: percent(complete, total),
        accuracy: Math.round(average(components.map((component) => CANONICAL_MATERIALS.includes(component.material) ? component.data_quality_score : 45))),
        traceability: percent(components.filter((component) => component.supplier_confirmed).length, total),
        evidenceLink: bestEvidenceLink(components, null),
        note: `${complete}/${total} components use the canonical material taxonomy.`
      };
    }
    case "Component weight": {
      const complete = components.filter((component) => component.weight_g > 0).length;
      const weightDocs = evidenceDocuments.filter((document) => document.evidence_type === "packaging_weight_confirmation");
      return {
        completeness: percent(complete, total),
        accuracy: 90,
        traceability: weightDocs.length ? 90 : 75,
        evidenceLink: null,
        note: `${complete}/${total} components have positive live weight values.`
      };
    }
    case "Supplier ID": {
      const complete = components.filter((component) => component.supplier_id && component.supplier_name).length;
      return {
        completeness: percent(complete, total),
        accuracy: 88,
        traceability: percent(components.filter((component) => component.supplier_confirmed).length, total),
        evidenceLink: null,
        note: `${complete}/${total} components have supplier IDs in the live state.`
      };
    }
    case "Recycled content percent": {
      const complete = components.filter((component) => component.recycled_content_percent !== null).length;
      const evidenceCount = evidenceDocuments.filter((document) => document.evidence_type === "recycled_content_certificate").length;
      return {
        completeness: percent(complete, total),
        accuracy: Math.round(average(components.map((component) => component.recycled_content_percent === null ? 40 : component.data_quality_score))),
        traceability: percent(evidenceCount, total),
        evidenceLink: bestEvidenceLink(components, "/sample-documents/recycled-content-certificate.pdf"),
        note: `${complete}/${total} components have recycled content values; ${evidenceCount} recycled-content evidence document(s) are linked.`
      };
    }
    case "Recyclability grade": {
      const complete = components.filter((component) => Boolean(component.recyclability_grade)).length;
      const evidenceCount = evidenceDocuments.filter((document) => document.evidence_type === "recyclability_test_report").length;
      return {
        completeness: percent(complete, total),
        accuracy: Math.round(average(components.map((component) => component.recyclability_grade ? component.data_quality_score : 45))),
        traceability: percent(evidenceCount, total),
        evidenceLink: bestEvidenceLink(components, "/sample-documents/recyclability-test-report.pdf"),
        note: `${complete}/${total} components have recyclability grades; ${evidenceCount} test report(s) are linked.`
      };
    }
    case "Certificate status": {
      const complete = components.filter((component) => component.certificate_status === "Valid" || component.certificate_status === "Not Required").length;
      return {
        completeness: percent(complete, total),
        accuracy: percent(components.filter((component) => component.certificate_status === "Valid").length, total),
        traceability: percent(components.filter((component) => component.certificate_id || component.certificate_status === "Not Required").length, total),
        evidenceLink: bestEvidenceLink(components, "/sample-documents/recycled-content-certificate.pdf"),
        note: `${complete}/${total} components have valid or not-required certificate status in the live state.`
      };
    }
    case "Evidence document link": {
      const complete = components.filter(
        (component) => component.evidence_url || hasAppliedLinkedEvidence(component, evidenceDocuments)
      ).length;
      return {
        completeness: percent(complete, total),
        accuracy: percent(complete, total),
        traceability: percent(evidenceDocuments.filter((document) => document.validation_status === "applied").length, total),
        evidenceLink: bestEvidenceLink(components, null),
        note: `${complete}/${total} components have evidence links or applied linked evidence documents.`
      };
    }
    case "Market country": {
      const complete = components.filter((component) => /^[A-Z]{2}$/.test(component.market_country)).length;
      return {
        completeness: percent(complete, total),
        accuracy: percent(complete, total),
        traceability: 94,
        evidenceLink: null,
        note: `${complete}/${total} components have normalized ISO-2 market country values.`
      };
    }
    case "Supplier confirmation": {
      const complete = components.filter((component) => component.supplier_confirmed).length;
      return {
        completeness: percent(complete, total),
        accuracy: percent(complete, total),
        traceability: percent(evidenceDocuments.filter((document) => document.evidence_type === "supplier_material_declaration").length, total),
        evidenceLink: bestEvidenceLink(components, "/sample-documents/supplier-declaration.pdf"),
        note: `${complete}/${total} components are supplier-confirmed in the live state.`
      };
    }
    case "Component aliases": {
      const complete = components.filter((component) => component.aliases.length > 1).length;
      return {
        completeness: percent(complete, total),
        accuracy: Math.round(average(components.map((component) => component.aliases.length > 1 ? component.data_quality_score : 50))),
        traceability: percent(components.filter((component) => component.supplier_confirmed).length, total),
        evidenceLink: null,
        note: `${complete}/${total} components have alias coverage; supplier confirmation controls traceability.`
      };
    }
    case "Payload generation event": {
      const complete = auditEvents.some((event) => event.action_type === "Payload regenerated" || event.action_type === "compliance score recalculated") ? 100 : 0;
      return {
        completeness: complete,
        accuracy: complete ? 98 : 60,
        traceability: complete ? 98 : 60,
        evidenceLink: null,
        note: `Audit trail contains ${auditEvents.length} live event(s), including evidence and recalculation actions.`
      };
    }
    default:
      return undefined;
  }
}

export function deriveDataInventoryRecords(
  baseRecords: DataInventoryRecord[],
  components: PackagingComponent[],
  evidenceDocuments: EvidenceDocument[],
  auditEvents: AuditEvent[]
) {
  return baseRecords.map((record) => {
    const metrics = deriveMetrics(record.datapoint, components, evidenceDocuments, auditEvents);
    if (!metrics) return record;

    const dqScore = Math.round(
      metrics.completeness * 0.45 + metrics.accuracy * 0.35 + metrics.traceability * 0.2
    );

    return {
      ...record,
      completeness_rating: metrics.completeness,
      accuracy_rating: metrics.accuracy,
      traceability_rating: metrics.traceability,
      dq_score: dqScore,
      evidence_link: metrics.evidenceLink,
      status: toStatus(metrics.completeness),
      notes: metrics.note
    };
  });
}
