import { describe, expect, it } from "vitest";
import { applyGuidedScenarioAutoSettings } from "../lib/ppwr-role-questionnaire";
import type { PpwrRoleScenario } from "../lib/ppwr-role-types";

const baseScenario: PpwrRoleScenario = {
  id: "custom-guided-scenario",
  title: "Custom guided scenario",
  description: "Custom scenario created through the guided PPWR role questionnaire.",
  flowType: "domestic",
  companyEstablishedInEU: true,
  companyMemberState: "DE",
  counterpartyEstablishedInEU: true,
  counterpartyMemberState: "DE",
  isIntraGroup: false,
  ownershipTransfers: true,
  manufacturesPackaging: false,
  manufacturesPackagedProduct: true,
  sellsUnderOwnBrand: true,
  importsFromThirdCountry: false,
  firstMakesAvailableInMemberState: true,
  sellsDirectlyToEndUsers: false,
  sellsViaMarketplace: false,
  fulfilmentProviderInvolved: false,
  onlyTransportOrLogistics: false,
  unpacksWithoutBeingEndUser: false,
  modifiesPackaging: false,
  privateLabelsOrRebrands: false,
  exportOnlyOutsideEU: false,
  packagingType: "packaged_product",
  targetMemberStates: ["DE"]
};

describe("PPWR role questionnaire auto settings", () => {
  it("updates checkmark flags when marketplace flow is selected", () => {
    const scenario = applyGuidedScenarioAutoSettings(
      {
        ...baseScenario,
        flowType: "marketplace",
        counterpartyMemberState: "FR"
      },
      "flowType"
    );

    expect(scenario.sellsViaMarketplace).toBe(true);
    expect(scenario.sellsDirectlyToEndUsers).toBe(true);
    expect(scenario.firstMakesAvailableInMemberState).toBe(true);
    expect(scenario.targetMemberStates).toEqual(["DE", "FR"]);
  });

  it("updates logistics checkmarks for intra-EU transport packaging", () => {
    const scenario = applyGuidedScenarioAutoSettings(
      {
        ...baseScenario,
        flowType: "intra_eu",
        counterpartyMemberState: "FR",
        packagingType: "transport_packaging"
      },
      "packagingType"
    );

    expect(scenario.onlyTransportOrLogistics).toBe(true);
    expect(scenario.ownershipTransfers).toBe(false);
    expect(scenario.firstMakesAvailableInMemberState).toBe(false);
  });

  it("updates EU establishment and target state when Member State fields change", () => {
    const withoutCompanyState = applyGuidedScenarioAutoSettings(
      {
        ...baseScenario,
        companyMemberState: undefined
      },
      "companyMemberState"
    );
    const withFrenchCounterparty = applyGuidedScenarioAutoSettings(
      {
        ...baseScenario,
        flowType: "intra_eu",
        counterpartyMemberState: "FR"
      },
      "counterpartyMemberState"
    );

    expect(withoutCompanyState.companyEstablishedInEU).toBe(false);
    expect(withFrenchCounterparty.counterpartyEstablishedInEU).toBe(true);
    expect(withFrenchCounterparty.targetMemberStates).toEqual(["FR"]);
  });

  it("updates export-only checkmarks when EU-to-third-country flow is selected", () => {
    const scenario = applyGuidedScenarioAutoSettings(
      {
        ...baseScenario,
        flowType: "eu_to_third_country"
      },
      "flowType"
    );

    expect(scenario.exportOnlyOutsideEU).toBe(true);
    expect(scenario.firstMakesAvailableInMemberState).toBe(false);
    expect(scenario.importsFromThirdCountry).toBe(false);
    expect(scenario.targetMemberStates).toEqual([]);
  });
});
