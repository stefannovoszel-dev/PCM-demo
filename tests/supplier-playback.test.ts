import { describe, expect, it } from "vitest";
import components from "../data/packaging-components.json";
import supplierEvents from "../data/supplier-events.json";
import { applySupplierEvent } from "../lib/supplier-playback";
import type { PackagingComponent, SupplierEvent } from "../lib/types";

describe("supplier playback", () => {
  it("updates component data and creates an audit event", () => {
    const event = (supplierEvents as unknown as SupplierEvent[])[0];
    const result = applySupplierEvent(components as unknown as PackagingComponent[], event);
    const component = result.components.find((item) => item.component_id === event.component_id);

    expect(component?.certificate_status).toBe("Valid");
    expect(component?.supplier_confirmed).toBe(true);
    expect(result.auditEvent.action_type).toBe("Supplier uploaded certificate");
  });
});
