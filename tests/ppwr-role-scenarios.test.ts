import { describe, expect, it } from "vitest";
import scenarios from "../data/ppwr-role-scenarios.json";
import { assessPpwrRole } from "../lib/ppwr-role-engine";
import type { PpwrRoleScenario } from "../lib/ppwr-role-types";

const scenarioList = scenarios as PpwrRoleScenario[];

const requiredScenarioIds = [
  "eu-domestic-brand-owner",
  "eu-brand-owner-de-to-fr",
  "eu-import-empty-packaging-china",
  "eu-import-packaged-goods-us",
  "non-eu-dtc-germany",
  "non-eu-to-german-distributor",
  "eu-parent-french-subsidiary",
  "non-eu-parent-german-subsidiary",
  "eu-cross-border-logistics-no-ownership",
  "eu-third-party-fulfilment",
  "eu-marketplace-sale",
  "private-label-distributor",
  "distributor-modifies-packaging",
  "unpacking-imported-products",
  "intra-group-ownership-transfer",
  "intra-group-logistics-no-transfer",
  "contract-manufacturing-brand-owner",
  "packaging-supplier-to-brand-owner",
  "retailer-final-distributor",
  "export-only-outside-eu"
];

describe("PPWR role scenarios", () => {
  it("covers the requested scenario library", () => {
    const ids = scenarioList.map((scenario) => scenario.id);

    expect(scenarioList).toHaveLength(20);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of requiredScenarioIds) {
      expect(ids).toContain(id);
    }
  });

  it("has complete scenario card metadata", () => {
    for (const scenario of scenarioList) {
      expect(scenario.title).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(scenario.flowType).toBeTruthy();
      expect(scenario.packagingType).toBeTruthy();
      expect(Array.isArray(scenario.targetMemberStates)).toBe(true);
    }
  });

  it("produces an assessment for every predefined scenario", () => {
    for (const scenario of scenarioList) {
      const assessment = assessPpwrRole(scenario);

      expect(assessment.scenarioId).toBe(scenario.id);
      expect(assessment.likelyRoles.length).toBeGreaterThan(0);
      expect(assessment.recommendedActions.length).toBeGreaterThan(0);
    }
  });
});
