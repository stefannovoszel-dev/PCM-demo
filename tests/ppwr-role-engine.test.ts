import { describe, expect, it } from "vitest";
import scenarios from "../data/ppwr-role-scenarios.json";
import { assessPpwrRole } from "../lib/ppwr-role-engine";
import type { PpwrRoleScenario } from "../lib/ppwr-role-types";

const scenarioList = scenarios as PpwrRoleScenario[];

function getScenario(id: string) {
  const scenario = scenarioList.find((item) => item.id === id);
  if (!scenario) {
    throw new Error(`Missing scenario fixture: ${id}`);
  }
  return scenario;
}

describe("PPWR role engine", () => {
  it("returns no EU placing-on-market role for export-only scenarios", () => {
    const assessment = assessPpwrRole(getScenario("export-only-outside-eu"));

    expect(assessment.noEuPlacingOnMarketRole).toBe(true);
    expect(assessment.eprProducer).toBe(false);
    expect(assessment.likelyRoles).toContain("No EU placing-on-market role");
    expect(assessment.roleAssignments).toContainEqual(
      expect.objectContaining({
        role: "No EU placing-on-market role",
        appliesTo: "Company"
      })
    );
    expect(assessment.confidence).toBe("high");
  });

  it("returns Importer and Producer for EPR when EU company imports from a third country and first makes available", () => {
    const assessment = assessPpwrRole(getScenario("eu-import-empty-packaging-china"));

    expect(assessment.likelyRoles).toContain("Importer");
    expect(assessment.likelyRoles).toContain("Producer for EPR");
    expect(assessment.importerResponsibility).toBe(true);
    expect(assessment.eprProducer).toBe(true);
    expect(assessment.eprMemberStates).toEqual(["DE"]);
    expect(assessment.roleAssignments).toContainEqual(
      expect.objectContaining({
        role: "Importer",
        appliesTo: "Company"
      })
    );
  });

  it("returns Producer for EPR and authorised representative for non-EU direct-to-consumer sales", () => {
    const assessment = assessPpwrRole(getScenario("non-eu-dtc-germany"));

    expect(assessment.likelyRoles).toContain("Producer for EPR");
    expect(assessment.likelyRoles).toContain("Authorised Representative for EPR");
    expect(assessment.eprProducer).toBe(true);
    expect(assessment.authorisedRepresentativeRequired).toBe(true);
  });

  it("marks cross-border EPR producer allocation as applying to the target Member State", () => {
    const assessment = assessPpwrRole(getScenario("eu-brand-owner-de-to-fr"));

    expect(assessment.roleAssignments).toContainEqual(
      expect.objectContaining({
        role: "Producer for EPR",
        appliesTo: "Target"
      })
    );
  });

  it("returns Supplier/data-provider relevance for packaging supplier only and not automatic EPR producer", () => {
    const assessment = assessPpwrRole(getScenario("packaging-supplier-to-brand-owner"));

    expect(assessment.likelyRoles).toContain("Supplier");
    expect(assessment.supplierDataObligation).toBe(true);
    expect(assessment.eprProducer).toBe(false);
    expect(assessment.likelyRoles).not.toContain("Producer for EPR");
  });

  it("returns Manufacturer and Producer for EPR for private-label distributors first making available", () => {
    const assessment = assessPpwrRole(getScenario("private-label-distributor"));

    expect(assessment.likelyRoles).toContain("Manufacturer");
    expect(assessment.technicalConformityRole).toContain("Manufacturer");
    expect(assessment.eprProducer).toBe(true);
    expect(assessment.likelyRoles).toContain("Producer for EPR");
    expect(assessment.roleAssignments).toContainEqual(
      expect.objectContaining({
        role: "Manufacturer",
        appliesTo: "Company"
      })
    );
  });

  it("does not automatically create producer role for logistics movement without ownership transfer", () => {
    const assessment = assessPpwrRole(getScenario("eu-cross-border-logistics-no-ownership"));

    expect(assessment.eprProducer).toBe(false);
    expect(assessment.likelyRoles).not.toContain("Producer for EPR");
    expect(assessment.reviewFlags.join(" ")).toMatch(/Logistics movement/);
  });

  it("identifies receiving subsidiary as likely EPR producer for intra-group first making available", () => {
    const assessment = assessPpwrRole(getScenario("intra-group-ownership-transfer"));

    expect(assessment.eprProducer).toBe(true);
    expect(assessment.eprResponsibleParty).toMatch(/subsidiary/i);
    expect(assessment.eprResponsibleParty).toMatch(/DE/);
    expect(assessment.roleAssignments).toContainEqual(
      expect.objectContaining({
        role: "Producer for EPR",
        appliesTo: "Counterparty"
      })
    );
  });

  it("returns Producer for EPR for unpacking without being end user", () => {
    const assessment = assessPpwrRole(getScenario("unpacking-imported-products"));

    expect(assessment.eprProducer).toBe(true);
    expect(assessment.likelyRoles).toContain("Producer for EPR");
    expect(assessment.eprResponsibleParty).toMatch(/unpacking/i);
  });

  it("returns marketplace verification relevance while producer remains responsible", () => {
    const assessment = assessPpwrRole(getScenario("eu-marketplace-sale"));

    expect(assessment.marketplaceVerificationRelevant).toBe(true);
    expect(assessment.likelyRoles).toContain("Online Marketplace");
    expect(assessment.eprProducer).toBe(true);
    expect(assessment.roleAssignments).toContainEqual(
      expect.objectContaining({
        role: "Online Marketplace",
        appliesTo: "Counterparty"
      })
    );
    expect(assessment.assumptions.join(" ")).toMatch(/producer remains responsible/i);
  });

  it("returns fulfilment verification relevance while producer remains responsible", () => {
    const assessment = assessPpwrRole(getScenario("eu-third-party-fulfilment"));

    expect(assessment.fulfilmentVerificationRelevant).toBe(true);
    expect(assessment.likelyRoles).toContain("Fulfilment Service Provider");
    expect(assessment.eprProducer).toBe(true);
    expect(assessment.assumptions.join(" ")).toMatch(/producer remains responsible/i);
  });
});
