import { describe, expect, it } from "vitest";
import { calculateMatchConfidence } from "../lib/matching";

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
});
