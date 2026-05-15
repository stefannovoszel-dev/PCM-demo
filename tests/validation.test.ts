import { describe, expect, it } from "vitest";
import components from "../data/packaging-components.json";
import { validateComponent } from "../lib/validation";
import type { PackagingComponent } from "../lib/types";

const baseComponent = (components as unknown as PackagingComponent[])[0];

describe("validation", () => {
  it("creates a validation warning when a recycled content certificate is missing", () => {
    const result = validateComponent({
      ...baseComponent,
      recycled_content_percent: 30,
      certificate_status: "Missing",
      certificate_id: null,
      evidence_url: "/sample-documents/supplier-declaration.pdf"
    });

    expect(result.warnings).toContain("certificate must be valid when recycled content claim exists");
  });

  it("fails invalid recycled content values", () => {
    const result = validateComponent({
      ...baseComponent,
      recycled_content_percent: 125
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("recycled_content_percent must be between 0 and 100");
  });
});
