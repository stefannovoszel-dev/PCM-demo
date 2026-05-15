import { describe, expect, it } from "vitest";
import products from "../data/products.json";
import components from "../data/packaging-components.json";
import { createOsapiensPayload, validateOsapiensPayload } from "../lib/osapiens-payload";
import type { PackagingComponent, Product } from "../lib/types";

describe("simulated osapiens payload", () => {
  it("includes all required top-level fields", () => {
    const payload = createOsapiensPayload(
      (products as unknown as Product[])[0],
      components as unknown as PackagingComponent[]
    );

    expect(payload).toHaveProperty("product_id");
    expect(payload).toHaveProperty("product_name");
    expect(payload).toHaveProperty("regulation");
    expect(payload).toHaveProperty("market_country");
    expect(payload).toHaveProperty("packaging_id");
    expect(payload).toHaveProperty("components");
    expect(payload).toHaveProperty("materials");
    expect(payload).toHaveProperty("weights");
    expect(payload).toHaveProperty("suppliers");
    expect(payload).toHaveProperty("recycled_content");
    expect(payload).toHaveProperty("recyclability_grade");
    expect(payload).toHaveProperty("evidence_documents");
    expect(payload.schema_notice).toContain("simulated osapiens-ready payload");
  });

  it("validates the simulated payload shape", () => {
    const payload = createOsapiensPayload(
      (products as unknown as Product[])[0],
      components as unknown as PackagingComponent[]
    );

    expect(validateOsapiensPayload(payload).valid).toBe(true);
  });
});
