import { describe, expect, it } from "vitest";
import rawErp from "../data/raw-erp-records.json";
import rawPlm from "../data/raw-plm-records.json";
import rawSupplier from "../data/raw-supplier-records.json";
import {
  buildHarmonisedDataRows,
  convertWeightToGrams,
  normaliseCountry,
  normaliseMaterial,
  applyTransformation
} from "../lib/transformations";

describe("transformations", () => {
  it("normalises PE-HD to HDPE", () => {
    expect(normaliseMaterial("PE-HD")).toBe("HDPE");
  });

  it("converts 0.012 kg to 12 g", () => {
    expect(convertWeightToGrams("0.012 kg")).toBe(12);
  });

  it("normalises Deutschland to DE", () => {
    expect(normaliseCountry("Deutschland")).toBe("DE");
  });

  it("applies a full record transformation", () => {
    expect(
      applyTransformation({
        material_code: "PE-HD",
        country: "Deutschland",
        weight: "0.012 kg",
        supplier: "Acme GmbH",
        recycled_content: "30 percent"
      })
    ).toMatchObject({
      material: "HDPE",
      market_country: "DE",
      weight_g: 12,
      supplier_id: "SUP-00492",
      recycled_content_percent: 30
    });
  });

  it("adds ERP, PLM and supplier source record IDs to harmonised rows", () => {
    const rows = buildHarmonisedDataRows({
      erpRecords: rawErp as unknown as Record<string, unknown>[],
      plmRecords: rawPlm as unknown as Record<string, unknown>[],
      supplierRecords: rawSupplier as unknown as Record<string, unknown>[]
    });
    const bottle = rows.find((row) => row.ERP_record_id === "ERP-9001");
    const cap = rows.find((row) => row.ERP_record_id === "ERP-9002");

    expect(bottle).toMatchObject({
      ERP_record_id: "ERP-9001",
      PLM_record_id: "PLM-7101",
      SUP_REC_record_id: "SUP-REC-3301"
    });
    expect(cap).toMatchObject({
      ERP_record_id: "ERP-9002",
      PLM_record_id: "PLM-7102",
      SUP_REC_record_id: "SUP-REC-3302"
    });
  });
});
