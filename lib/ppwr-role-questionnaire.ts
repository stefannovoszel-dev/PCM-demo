import type { PpwrRoleScenario } from "./ppwr-role-types";

type AutoUpdateKey =
  | "flowType"
  | "packagingType"
  | "companyMemberState"
  | "counterpartyMemberState"
  | "targetMemberStates";

function cleanMemberState(value?: string) {
  const cleaned = value?.trim().toUpperCase();
  return cleaned || undefined;
}

function uniqueStates(states: string[]) {
  return Array.from(new Set(states.map((state) => state.trim().toUpperCase()).filter(Boolean)));
}

function firstAvailableState(scenario: PpwrRoleScenario) {
  return scenario.counterpartyMemberState ?? scenario.companyMemberState;
}

function defaultTargetsForFlow(scenario: PpwrRoleScenario) {
  if (scenario.flowType === "eu_to_third_country") return [];

  if (scenario.flowType === "marketplace") {
    return uniqueStates([
      scenario.companyMemberState,
      scenario.counterpartyMemberState,
      ...scenario.targetMemberStates
    ].filter(Boolean) as string[]);
  }

  if (["intra_eu", "intra_group"].includes(scenario.flowType)) {
    return firstAvailableState(scenario) ? [firstAvailableState(scenario) as string] : scenario.targetMemberStates;
  }

  return scenario.companyMemberState ? [scenario.companyMemberState] : scenario.targetMemberStates;
}

function applyFlowDefaults(scenario: PpwrRoleScenario, changedKey: AutoUpdateKey): PpwrRoleScenario {
  const next = { ...scenario };

  if (changedKey === "flowType") {
    if (next.flowType !== "eu_to_third_country" && !next.companyMemberState) {
      next.companyMemberState = "DE";
    }

    if (next.flowType === "domestic" && !next.counterpartyMemberState) {
      next.counterpartyMemberState = next.companyMemberState;
    }

    if (["intra_eu", "intra_group", "marketplace"].includes(next.flowType) && !next.counterpartyMemberState) {
      next.counterpartyMemberState = next.companyMemberState === "FR" ? "DE" : "FR";
    }
  }

  const companyEstablishedInEU = Boolean(next.companyMemberState);
  const counterpartyEstablishedInEU = Boolean(next.counterpartyMemberState);

  const common = {
    companyEstablishedInEU,
    counterpartyEstablishedInEU,
    isIntraGroup: false,
    ownershipTransfers: true,
    manufacturesPackaging: false,
    manufacturesPackagedProduct: next.packagingType !== "empty_packaging",
    sellsUnderOwnBrand: next.packagingType !== "empty_packaging",
    importsFromThirdCountry: false,
    firstMakesAvailableInMemberState: true,
    sellsDirectlyToEndUsers: false,
    sellsViaMarketplace: false,
    fulfilmentProviderInvolved: false,
    onlyTransportOrLogistics: false,
    unpacksWithoutBeingEndUser: false,
    modifiesPackaging: false,
    privateLabelsOrRebrands: false,
    exportOnlyOutsideEU: false
  };

  Object.assign(next, common);

  if (next.flowType === "domestic") {
    next.counterpartyMemberState = next.counterpartyMemberState ?? next.companyMemberState;
    next.counterpartyEstablishedInEU = Boolean(next.counterpartyMemberState);
  }

  if (next.flowType === "intra_eu") {
    next.companyEstablishedInEU = true;
    next.counterpartyEstablishedInEU = true;
  }

  if (next.flowType === "third_country_to_eu") {
    next.counterpartyMemberState = undefined;
    next.counterpartyEstablishedInEU = false;
    next.importsFromThirdCountry = next.companyEstablishedInEU;
    next.sellsDirectlyToEndUsers = !next.companyEstablishedInEU;
    next.manufacturesPackagedProduct = !next.companyEstablishedInEU || next.packagingType === "empty_packaging";
    next.sellsUnderOwnBrand = !next.companyEstablishedInEU || next.packagingType === "empty_packaging";
  }

  if (next.flowType === "eu_to_third_country") {
    next.counterpartyMemberState = undefined;
    next.counterpartyEstablishedInEU = false;
    next.importsFromThirdCountry = false;
    next.firstMakesAvailableInMemberState = false;
    next.exportOnlyOutsideEU = true;
  }

  if (next.flowType === "intra_group") {
    next.companyEstablishedInEU = true;
    next.counterpartyEstablishedInEU = true;
    next.isIntraGroup = true;
  }

  if (next.flowType === "marketplace") {
    next.sellsDirectlyToEndUsers = true;
    next.sellsViaMarketplace = true;
    next.packagingType = next.packagingType === "transport_packaging" ? "ecommerce_packaging" : next.packagingType;
  }

  if (next.flowType === "fulfilment") {
    next.sellsDirectlyToEndUsers = true;
    next.fulfilmentProviderInvolved = true;
    next.packagingType = next.packagingType === "transport_packaging" ? "ecommerce_packaging" : next.packagingType;
  }

  if (next.flowType === "contract_manufacturing") {
    next.sellsUnderOwnBrand = true;
    next.manufacturesPackagedProduct = false;
  }

  if (next.flowType === "private_label") {
    next.sellsUnderOwnBrand = true;
    next.manufacturesPackagedProduct = false;
    next.privateLabelsOrRebrands = true;
  }

  if (next.flowType === "unpacking") {
    next.counterpartyMemberState = undefined;
    next.counterpartyEstablishedInEU = false;
    next.importsFromThirdCountry = true;
    next.firstMakesAvailableInMemberState = false;
    next.manufacturesPackagedProduct = false;
    next.sellsUnderOwnBrand = false;
    next.unpacksWithoutBeingEndUser = true;
  }

  return next;
}

function applyPackagingDefaults(scenario: PpwrRoleScenario): PpwrRoleScenario {
  const next = { ...scenario };

  if (next.packagingType === "empty_packaging" && next.flowType !== "third_country_to_eu") {
    next.manufacturesPackaging = true;
    next.manufacturesPackagedProduct = false;
    next.sellsUnderOwnBrand = false;
    next.firstMakesAvailableInMemberState = false;
    next.sellsDirectlyToEndUsers = false;
  }

  if (next.packagingType === "empty_packaging" && next.flowType === "third_country_to_eu") {
    next.importsFromThirdCountry = next.companyEstablishedInEU;
    next.manufacturesPackaging = false;
    next.manufacturesPackagedProduct = true;
    next.sellsUnderOwnBrand = true;
    next.firstMakesAvailableInMemberState = true;
  }

  if (next.packagingType === "packaged_product" || next.packagingType === "mixed") {
    if (!["private_label", "unpacking", "contract_manufacturing"].includes(next.flowType)) {
      next.manufacturesPackagedProduct = true;
      next.sellsUnderOwnBrand = true;
    }
  }

  if (next.packagingType === "service_packaging" || next.packagingType === "ecommerce_packaging") {
    next.manufacturesPackagedProduct = true;
    next.sellsUnderOwnBrand = true;
    next.firstMakesAvailableInMemberState = true;
  }

  if (next.packagingType === "ecommerce_packaging") {
    next.sellsDirectlyToEndUsers = true;
  }

  if (next.packagingType === "transport_packaging" && ["intra_eu", "intra_group"].includes(next.flowType)) {
    next.manufacturesPackaging = false;
    next.manufacturesPackagedProduct = false;
    next.sellsUnderOwnBrand = false;
    next.firstMakesAvailableInMemberState = false;
    next.onlyTransportOrLogistics = true;
    next.ownershipTransfers = false;
  }

  if (next.exportOnlyOutsideEU) {
    next.firstMakesAvailableInMemberState = false;
    next.sellsDirectlyToEndUsers = false;
    next.sellsViaMarketplace = false;
    next.fulfilmentProviderInvolved = false;
    next.importsFromThirdCountry = false;
  }

  return next;
}

export function applyGuidedScenarioAutoSettings(
  scenario: PpwrRoleScenario,
  changedKey: AutoUpdateKey
): PpwrRoleScenario {
  const cleaned: PpwrRoleScenario = {
    ...scenario,
    companyMemberState: cleanMemberState(scenario.companyMemberState),
    counterpartyMemberState: cleanMemberState(scenario.counterpartyMemberState),
    targetMemberStates: uniqueStates(scenario.targetMemberStates)
  };

  const withFlowDefaults = applyFlowDefaults(cleaned, changedKey);
  const withPackagingDefaults = applyPackagingDefaults(withFlowDefaults);

  return {
    ...withPackagingDefaults,
    targetMemberStates:
      changedKey === "targetMemberStates"
        ? uniqueStates(scenario.targetMemberStates)
        : uniqueStates(defaultTargetsForFlow(withPackagingDefaults))
  };
}
