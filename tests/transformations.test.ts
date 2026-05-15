import { describe, expect, it } from "vitest";
import {
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
});
