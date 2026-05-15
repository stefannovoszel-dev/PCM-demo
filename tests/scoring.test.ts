import { describe, expect, it } from "vitest";
import components from "../data/packaging-components.json";
import supplierEvents from "../data/supplier-events.json";
import { calculateReadiness } from "../lib/scoring";
import { applySupplierEvent } from "../lib/supplier-playback";
import type { PackagingComponent, SupplierEvent } from "../lib/types";

describe("readiness scoring", () => {
  it("calculates initial readiness around the intended demo range", () => {
    const readiness = calculateReadiness(components as unknown as PackagingComponent[]);
    expect(readiness.score).toBeGreaterThanOrEqual(58);
    expect(readiness.score).toBeLessThanOrEqual(66);
  });

  it("improves after supplier playback", () => {
    const initialComponents = components as unknown as PackagingComponent[];
    const initial = calculateReadiness(initialComponents);
    const after = (supplierEvents as unknown as SupplierEvent[]).reduce(
      (current, event) => applySupplierEvent(current, event).components,
      initialComponents
    );
    const improved = calculateReadiness(after);

    expect(improved.score).toBeGreaterThan(initial.score);
    expect(improved.score).toBeGreaterThanOrEqual(89);
  });
});
