import { describe, expect, it } from "vitest";
import components from "../data/packaging-components.json";
import { getComponentWarningContext, getComponentWarningContexts } from "../lib/component-warning-context";
import type { PackagingComponent } from "../lib/types";

const demoComponents = components as PackagingComponent[];

describe("component warning context", () => {
  it("explains missing recycled content with legal context", () => {
    const shrinkFilm = demoComponents.find((component) => component.component_id === "CMP-1004");
    if (!shrinkFilm) throw new Error("Missing shrink film fixture");

    const contexts = getComponentWarningContexts(shrinkFilm);
    const recycledContent = contexts.find((context) => context.fieldKey === "recycled_content_percent");

    expect(recycledContent?.missing).toMatch(/recycled content percentage/i);
    expect(recycledContent?.legalContext).toMatch(/PPWR recycled content claims/i);
    expect(recycledContent?.requiredEvidence).toContain("Supplier material declaration");
  });

  it("explains expired certificates as a valid-certificate warning", () => {
    const cap = demoComponents.find((component) => component.component_id === "CMP-1002");
    if (!cap) throw new Error("Missing cap fixture");

    const context = getComponentWarningContext(cap, "valid_certificate");

    expect(context.status).toBe("expired");
    expect(context.missing).toMatch(/expired/i);
    expect(context.legalReference).toBe("PPWR evidence substantiation");
  });
});
