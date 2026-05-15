import { describe, expect, it } from "vitest";
import components from "../data/packaging-components.json";
import rawErp from "../data/raw-erp-records.json";
import rawPlm from "../data/raw-plm-records.json";
import rawSupplier from "../data/raw-supplier-records.json";
import {
  applyAcceptedMatchNamesToHarmonisedRows,
  applyCandidateANameToHarmonisedRows,
  calculateMatchConfidence,
  createAiMatchCandidatesFromHarmonisedRows
} from "../lib/matching";
import { buildHarmonisedDataRows } from "../lib/transformations";
import type { PackagingComponent } from "../lib/types";

describe("matching", () => {
  it("scores Blue HDPE Cap 28mm and Closure PE-HD blue 28 mm above 90", () => {
    const result = calculateMatchConfidence(
      {
        component_name: "Blue HDPE Cap 28mm",
        material: "HDPE",
        supplier_id: "SUP-00492",
        weight_g: 2.7,
        dimensions: { diameter_mm: 28 }
      },
      {
        component_name: "Closure PE-HD blue 28 mm",
        material: "PE-HD",
        supplier_name: "Acme GmbH",
        weight_g: 2.72,
        dimensions: { diameter_mm: 28 }
      }
    );

    expect(result.confidence).toBeGreaterThan(90);
    expect(result.recommended_action).toBe("Accept match");
  });

  it("scores label and sleeve aliases around review range", () => {
    const result = calculateMatchConfidence(
      {
        component_name: "Label PET transparent",
        material: "PET",
        supplier_name: "Labelhaus Europe",
        weight_g: 1.8
      },
      {
        component_name: "Sleeve PET clear",
        material: "PET clear",
        supplier_name: "Labelhaus Europe",
        weight_g: 1.9
      }
    );

    expect(result.confidence).toBeGreaterThanOrEqual(65);
    expect(result.confidence).toBeLessThan(90);
    expect(result.recommended_action).toMatch(/Review|Request/);
  });

  it("creates AI match candidates from harmonised ETL rows with source record IDs", () => {
    const harmonisedRows = buildHarmonisedDataRows({
      erpRecords: rawErp as unknown as Record<string, unknown>[],
      plmRecords: rawPlm as unknown as Record<string, unknown>[],
      supplierRecords: rawSupplier as unknown as Record<string, unknown>[]
    });
    const candidates = createAiMatchCandidatesFromHarmonisedRows(
      components as unknown as PackagingComponent[],
      harmonisedRows
    );
    const cap = candidates.find((candidate) => candidate.candidate_b.ERP_record_id === "ERP-9002");

    expect(cap?.candidate_a.component_id).toBe("CMP-1002");
    expect(cap?.candidate_b.PLM_record_id).toBe("PLM-7102");
    expect(cap?.candidate_b.SUP_REC_record_id).toBe("SUP-REC-3302");
  });

  it("syncs an accepted match name back to the matching harmonised ETL row", () => {
    const harmonisedRows = buildHarmonisedDataRows({
      erpRecords: rawErp as unknown as Record<string, unknown>[],
      plmRecords: rawPlm as unknown as Record<string, unknown>[],
      supplierRecords: rawSupplier as unknown as Record<string, unknown>[]
    });
    const candidates = createAiMatchCandidatesFromHarmonisedRows(
      components as unknown as PackagingComponent[],
      harmonisedRows
    );
    const cap = candidates.find((candidate) => candidate.candidate_b.ERP_record_id === "ERP-9002");
    if (!cap) throw new Error("Missing cap match candidate");

    const updatedRows = applyCandidateANameToHarmonisedRows(harmonisedRows, cap);
    const updatedCapRow = updatedRows.find((row) => row.harmonised_row_id === cap.candidate_b.harmonised_row_id);

    expect(updatedCapRow?.component_name).toBe(cap.candidate_a.component_name);
  });

  it("renders accepted Candidate A names onto harmonised ETL rows", () => {
    const harmonisedRows = buildHarmonisedDataRows({
      erpRecords: rawErp as unknown as Record<string, unknown>[],
      plmRecords: rawPlm as unknown as Record<string, unknown>[],
      supplierRecords: rawSupplier as unknown as Record<string, unknown>[]
    });
    const candidates = createAiMatchCandidatesFromHarmonisedRows(
      components as unknown as PackagingComponent[],
      harmonisedRows
    );
    const cap = candidates.find((candidate) => candidate.candidate_b.ERP_record_id === "ERP-9002");
    if (!cap) throw new Error("Missing cap match candidate");

    const displayedRows = applyAcceptedMatchNamesToHarmonisedRows(harmonisedRows, [
      {
        ...cap,
        status: "Accepted"
      }
    ]);
    const displayedCapRow = displayedRows.find((row) => row.harmonised_row_id === cap.candidate_b.harmonised_row_id);

    expect(displayedCapRow?.component_name).toBe(cap.candidate_a.component_name);
  });
});
