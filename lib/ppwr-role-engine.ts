import {
  ROLE_DATA_REQUIREMENTS,
  ROLE_RESPONSIBILITY_ITEMS
} from "./ppwr-role-responsibilities";
import type { PpwrRole, PpwrRoleAssessment, PpwrRoleAssignment, PpwrRoleScenario } from "./ppwr-role-types";

const STANDARD_RECOMMENDED_ACTIONS = [
  "Map legal entities and Member States.",
  "Identify first placing/making available event per Member State.",
  "Confirm importer of record.",
  "Confirm whether goods are sold under own brand/private label.",
  "Confirm whether packaging is modified.",
  "Confirm whether a PRO is used.",
  "Confirm whether an authorised representative for EPR is required.",
  "Collect packaging material, weight, recyclability, recycled content and evidence data.",
  "Create EPR registration and reporting data ownership."
];

const SUPPLIER_EVIDENCE_DATA = [
  "material composition",
  "weights",
  "recycled content evidence",
  "substances information",
  "recyclability data",
  "certificates"
];

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function addFromRoleMap(roles: PpwrRole[], map: Partial<Record<PpwrRole, string[]>>) {
  return unique(roles.flatMap((role) => map[role] ?? []));
}

function getDefaultMemberStates(scenario: PpwrRoleScenario) {
  if (scenario.targetMemberStates.length > 0) {
    return scenario.targetMemberStates;
  }

  return scenario.companyMemberState ? [scenario.companyMemberState] : [];
}

function isCrossBorderWithinEu(scenario: PpwrRoleScenario) {
  const targetStates = getDefaultMemberStates(scenario);
  return (
    scenario.companyEstablishedInEU &&
    Boolean(scenario.companyMemberState) &&
    targetStates.some((memberState) => memberState !== scenario.companyMemberState)
  );
}

function isSupplierOnlyScenario(scenario: PpwrRoleScenario) {
  return (
    scenario.packagingType === "empty_packaging" &&
    !scenario.importsFromThirdCountry &&
    !scenario.manufacturesPackagedProduct &&
    !scenario.sellsUnderOwnBrand &&
    !scenario.firstMakesAvailableInMemberState &&
    !scenario.sellsDirectlyToEndUsers &&
    !scenario.sellsViaMarketplace &&
    !scenario.fulfilmentProviderInvolved &&
    !scenario.privateLabelsOrRebrands &&
    !scenario.modifiesPackaging
  );
}

function determineEprResponsibleParty(scenario: PpwrRoleScenario, eprProducer: boolean) {
  if (!eprProducer) {
    return "No likely EPR producer identified for the assessed company flow.";
  }

  if (!scenario.companyEstablishedInEU && scenario.sellsDirectlyToEndUsers) {
    return "Non-EU seller for direct-to-end-user sales in the target Member State(s).";
  }

  if (
    scenario.isIntraGroup &&
    scenario.ownershipTransfers &&
    scenario.counterpartyEstablishedInEU &&
    scenario.counterpartyMemberState
  ) {
    return `Receiving subsidiary or legal entity in ${scenario.counterpartyMemberState} if it first makes the goods available there.`;
  }

  if (
    scenario.isIntraGroup &&
    scenario.importsFromThirdCountry &&
    scenario.companyEstablishedInEU &&
    scenario.companyMemberState
  ) {
    return `EU subsidiary/importer in ${scenario.companyMemberState} if it imports and first makes the goods available.`;
  }

  if (scenario.unpacksWithoutBeingEndUser) {
    return "Company unpacking packaged products without being the final end user.";
  }

  if (scenario.importsFromThirdCountry && scenario.companyEstablishedInEU) {
    return "EU importer that first makes the packaging or packaged product available.";
  }

  if (isCrossBorderWithinEu(scenario)) {
    return "Company or local entity/distributor that first makes the goods available in the destination Member State.";
  }

  return "Company that first makes packaging or packaged products available in the relevant Member State.";
}

function addRoleAssignment(
  assignments: PpwrRoleAssignment[],
  role: PpwrRole,
  appliesTo: PpwrRoleAssignment["appliesTo"],
  explanation: string
) {
  if (
    assignments.some(
      (assignment) =>
        assignment.role === role &&
        assignment.appliesTo === appliesTo &&
        assignment.explanation === explanation
    )
  ) {
    return;
  }

  assignments.push({ role, appliesTo, explanation });
}

function formatTargetMemberStates(scenario: PpwrRoleScenario) {
  const targetStates = getDefaultMemberStates(scenario);
  return targetStates.length > 0 ? targetStates.join(", ") : "the target Member State(s)";
}

function getEprAssignment(scenario: PpwrRoleScenario): Pick<PpwrRoleAssignment, "appliesTo" | "explanation"> {
  const targetLabel = formatTargetMemberStates(scenario);

  if (
    scenario.isIntraGroup &&
    scenario.ownershipTransfers &&
    scenario.counterpartyEstablishedInEU &&
    scenario.counterpartyMemberState
  ) {
    return {
      appliesTo: "Counterparty",
      explanation: `Receiving subsidiary or legal entity in ${scenario.counterpartyMemberState} if it first makes the goods available there.`
    };
  }

  if (!scenario.companyEstablishedInEU && scenario.sellsDirectlyToEndUsers) {
    return {
      appliesTo: "Company",
      explanation: `Non-EU company selling directly to end users in ${targetLabel}.`
    };
  }

  if (isCrossBorderWithinEu(scenario)) {
    return {
      appliesTo: "Target",
      explanation: `First making available in ${targetLabel}; confirm whether the company or a local entity owns that role.`
    };
  }

  if (scenario.unpacksWithoutBeingEndUser) {
    return {
      appliesTo: "Company",
      explanation: "Company unpacking packaged products without being the final end user."
    };
  }

  if (scenario.importsFromThirdCountry && scenario.companyEstablishedInEU) {
    return {
      appliesTo: "Company",
      explanation: `EU importer if it first makes the packaging or packaged product available in ${targetLabel}.`
    };
  }

  return {
    appliesTo: "Company",
    explanation: `Company first making packaging or packaged products available in ${targetLabel}.`
  };
}

function buildRoleAssignments(scenario: PpwrRoleScenario, likelyRoles: PpwrRole[]): PpwrRoleAssignment[] {
  const assignments: PpwrRoleAssignment[] = [];
  const targetLabel = formatTargetMemberStates(scenario);

  if (likelyRoles.includes("No EU placing-on-market role")) {
    addRoleAssignment(
      assignments,
      "No EU placing-on-market role",
      "Company",
      "Company has no EU placing-on-market role if the export-only assumption is confirmed."
    );
  }

  if (likelyRoles.includes("Manufacturer")) {
    addRoleAssignment(
      assignments,
      "Manufacturer",
      "Company",
      scenario.privateLabelsOrRebrands || scenario.modifiesPackaging
        ? "Company rebrands, private-labels or modifies packaging in a way that can shift conformity responsibility."
        : "Company manufactures packaging or packaged products, or sells under its own name or trademark."
    );
  }

  if (likelyRoles.includes("Importer")) {
    addRoleAssignment(
      assignments,
      "Importer",
      "Company",
      "Company is EU-established and imports packaging or packaged products from a third country."
    );
  }

  if (likelyRoles.includes("Distributor")) {
    if (
      scenario.isIntraGroup &&
      scenario.ownershipTransfers &&
      scenario.counterpartyEstablishedInEU &&
      scenario.counterpartyMemberState
    ) {
      addRoleAssignment(
        assignments,
        "Distributor",
        "Counterparty",
        `Receiving entity in ${scenario.counterpartyMemberState} may make the goods available locally.`
      );
    } else {
      addRoleAssignment(
        assignments,
        "Distributor",
        "Company",
        "Company makes packaging or packaged products available in the supply chain."
      );
    }
  }

  if (likelyRoles.includes("Producer for EPR")) {
    const eprAssignment = getEprAssignment(scenario);
    addRoleAssignment(assignments, "Producer for EPR", eprAssignment.appliesTo, eprAssignment.explanation);
  }

  if (likelyRoles.includes("Supplier")) {
    addRoleAssignment(
      assignments,
      "Supplier",
      "Company",
      "Company supplies packaging, packaging components or packaging material as a data provider."
    );
  }

  if (likelyRoles.includes("Authorised Representative for EPR")) {
    addRoleAssignment(
      assignments,
      "Authorised Representative for EPR",
      "Target",
      `Representative requirement is assessed per target Member State: ${targetLabel}.`
    );
  }

  if (likelyRoles.includes("Final Distributor")) {
    addRoleAssignment(
      assignments,
      "Final Distributor",
      "Company",
      "Company delivers packaged products to the final end user."
    );
  }

  if (likelyRoles.includes("Fulfilment Service Provider")) {
    addRoleAssignment(
      assignments,
      "Fulfilment Service Provider",
      "Counterparty",
      "Third-party fulfilment operator involved in warehousing, packing, addressing or dispatching."
    );
  }

  if (likelyRoles.includes("Online Marketplace")) {
    addRoleAssignment(
      assignments,
      "Online Marketplace",
      "Counterparty",
      "Marketplace or platform operator has verification/gatekeeper relevance."
    );
  }

  if (likelyRoles.includes("Review Required")) {
    addRoleAssignment(
      assignments,
      "Review Required",
      "Target",
      "Role allocation depends on the target Member State flow, ownership transfer and legal entity setup."
    );
  }

  return assignments;
}

function confidenceFromReviewFlags(reviewFlags: string[]) {
  if (reviewFlags.length === 0) {
    return "high";
  }

  if (reviewFlags.length <= 3) {
    return "medium";
  }

  return "low";
}

export function assessPpwrRole(scenario: PpwrRoleScenario): PpwrRoleAssessment {
  const roles = new Set<PpwrRole>();
  const technicalConformityRoles = new Set<PpwrRole>();
  const assumptions: string[] = [];
  const reviewFlags: string[] = [];
  const targetMemberStates = getDefaultMemberStates(scenario);

  if (scenario.exportOnlyOutsideEU) {
    return {
      scenarioId: scenario.id,
      likelyRoles: ["No EU placing-on-market role"],
      roleAssignments: buildRoleAssignments(scenario, ["No EU placing-on-market role"]),
      technicalConformityRole: [],
      eprProducer: false,
      eprResponsibleParty: "No EU EPR producer role if no EU placing-on-market or making-available event occurs.",
      eprMemberStates: [],
      authorisedRepresentativeRequired: false,
      importerResponsibility: false,
      distributorResponsibility: false,
      manufacturerResponsibility: false,
      supplierDataObligation: false,
      marketplaceVerificationRelevant: false,
      fulfilmentVerificationRelevant: false,
      finalDistributorRelevant: false,
      noEuPlacingOnMarketRole: true,
      confidence: "high",
      assumptions: [
        "The packaged products leave the EU and are not placed or made available on the EU market."
      ],
      keyObligations: [
        "Keep evidence that the products are export-only and no EU market availability occurs."
      ],
      dataRequired: [
        "export destination",
        "shipment records",
        "customer destination",
        "evidence that no EU market availability occurs"
      ],
      recommendedActions: STANDARD_RECOMMENDED_ACTIONS,
      reviewFlags: ["Confirm no EU placing-on-market event occurs."]
    };
  }

  const supplierOnlyScenario = isSupplierOnlyScenario(scenario);
  const manufacturerCandidate =
    scenario.manufacturesPackaging ||
    scenario.manufacturesPackagedProduct ||
    scenario.sellsUnderOwnBrand ||
    scenario.privateLabelsOrRebrands ||
    scenario.modifiesPackaging;

  let eprProducer = false;
  let authorisedRepresentativeRequired = false;
  let importerResponsibility = false;
  let distributorResponsibility = false;
  let supplierDataObligation = false;
  let marketplaceVerificationRelevant = false;
  let fulfilmentVerificationRelevant = false;
  let finalDistributorRelevant = false;

  if (manufacturerCandidate) {
    roles.add("Manufacturer");
    technicalConformityRoles.add("Manufacturer");
    assumptions.push(
      "Manufacturing, own-brand sales, private labelling or packaging modification can create a technical conformity manufacturer role."
    );
  }

  if (scenario.privateLabelsOrRebrands) {
    assumptions.push("Private label or rebranding can move conformity responsibility to the private-label company.");
  }

  if (scenario.modifiesPackaging) {
    reviewFlags.push("Assess whether the packaging modification affects PPWR compliance before resale.");
  }

  if (scenario.companyEstablishedInEU && scenario.importsFromThirdCountry) {
    roles.add("Importer");
    technicalConformityRoles.add("Importer");
    importerResponsibility = true;
    assumptions.push("An EU-established party importing from a third country can have importer duties.");
  }

  if (supplierOnlyScenario) {
    roles.add("Supplier");
    supplierDataObligation = true;
    assumptions.push(
      "A packaging or material supplier provides technical evidence but is not automatically the EPR producer."
    );
  }

  const makesAvailable =
    scenario.firstMakesAvailableInMemberState ||
    scenario.ownershipTransfers ||
    scenario.sellsDirectlyToEndUsers;
  const distributorCandidate =
    makesAvailable &&
    !scenario.onlyTransportOrLogistics &&
    !scenario.importsFromThirdCountry &&
    !supplierOnlyScenario;

  if (distributorCandidate && (!manufacturerCandidate || scenario.privateLabelsOrRebrands || scenario.modifiesPackaging)) {
    roles.add("Distributor");
    distributorResponsibility = true;
  }

  if (scenario.onlyTransportOrLogistics && !scenario.ownershipTransfers) {
    reviewFlags.push(
      "Logistics movement without ownership transfer does not automatically create an EPR producer role; identify who first makes the goods available."
    );
  }

  if (
    scenario.firstMakesAvailableInMemberState ||
    scenario.unpacksWithoutBeingEndUser ||
    (!scenario.companyEstablishedInEU && scenario.sellsDirectlyToEndUsers)
  ) {
    roles.add("Producer for EPR");
    eprProducer = true;
  }

  if (scenario.unpacksWithoutBeingEndUser) {
    assumptions.push("Unpacking packaged products without being the end user can trigger EPR producer responsibility for that packaging.");
  }

  if (!scenario.companyEstablishedInEU && scenario.sellsDirectlyToEndUsers) {
    authorisedRepresentativeRequired = true;
    roles.add("Authorised Representative for EPR");
    reviewFlags.push(
      "Non-EU direct-to-end-user sales should be checked for authorised representative requirements in each target Member State."
    );
  }

  if (scenario.companyEstablishedInEU && eprProducer && isCrossBorderWithinEu(scenario)) {
    authorisedRepresentativeRequired = true;
    roles.add("Authorised Representative for EPR");
    reviewFlags.push(
      "Cross-border EPR producer status may require an authorised representative or local registration depending on national setup."
    );
  }

  if (scenario.sellsDirectlyToEndUsers) {
    roles.add("Final Distributor");
    finalDistributorRelevant = true;
  }

  if (scenario.sellsViaMarketplace) {
    roles.add("Online Marketplace");
    marketplaceVerificationRelevant = true;
    assumptions.push(
      "Marketplace verification/gatekeeper duties may be relevant, while the producer remains responsible for the accuracy of EPR information."
    );
  }

  if (scenario.fulfilmentProviderInvolved) {
    roles.add("Fulfilment Service Provider");
    fulfilmentVerificationRelevant = true;
    assumptions.push(
      "Fulfilment provider verification duties may be relevant, while the producer remains responsible for EPR information accuracy."
    );
  }

  if (!scenario.companyEstablishedInEU && !scenario.sellsDirectlyToEndUsers && scenario.counterpartyEstablishedInEU) {
    reviewFlags.push(
      "Confirm Incoterms, importer of record, ownership transfer and first making available; the EU distributor/importer may be the Importer and EPR producer."
    );
  }

  if (scenario.companyEstablishedInEU && scenario.importsFromThirdCountry && !scenario.counterpartyEstablishedInEU) {
    reviewFlags.push(
      "Confirm Incoterms, importer of record, ownership transfer and first making available for the third-country supply flow."
    );
  }

  if (scenario.isIntraGroup) {
    reviewFlags.push(
      "Assess PPWR roles per legal entity and Member State; intra-group ownership transfer can change the EPR producer."
    );

    if (!scenario.ownershipTransfers && scenario.onlyTransportOrLogistics) {
      reviewFlags.push(
        "Intra-group logistics movement without ownership transfer should not be treated as a producer event without a making-available step."
      );
    }
  }

  if (
    scenario.isIntraGroup &&
    scenario.companyEstablishedInEU &&
    !scenario.counterpartyEstablishedInEU &&
    scenario.importsFromThirdCountry
  ) {
    reviewFlags.push(
      "For non-EU parent to EU subsidiary flows, confirm whether the EU subsidiary imports and first makes goods available."
    );
  }

  if (scenario.isIntraGroup && scenario.counterpartyEstablishedInEU && scenario.counterpartyMemberState) {
    assumptions.push(
      `If the ${scenario.counterpartyMemberState} subsidiary takes ownership and places goods on its market, it is likely the EPR producer there.`
    );
  }

  if (eprProducer && targetMemberStates.length === 0) {
    reviewFlags.push("Add target Member State(s) before creating EPR registration and reporting ownership.");
  }

  if (reviewFlags.length > 0) {
    roles.add("Review Required");
  }

  const likelyRoles = Array.from(roles);
  const technicalConformityRole = Array.from(technicalConformityRoles);
  const obligationRoles = likelyRoles.filter(
    (role) => role !== "Review Required" && role !== "No EU placing-on-market role"
  );
  const keyObligations = addFromRoleMap(obligationRoles, ROLE_RESPONSIBILITY_ITEMS);
  const dataRequired = unique([
    ...addFromRoleMap(obligationRoles, ROLE_DATA_REQUIREMENTS),
    ...(supplierDataObligation ? SUPPLIER_EVIDENCE_DATA : [])
  ]);

  return {
    scenarioId: scenario.id,
    likelyRoles,
    roleAssignments: buildRoleAssignments(scenario, likelyRoles),
    technicalConformityRole,
    eprProducer,
    eprResponsibleParty: determineEprResponsibleParty(scenario, eprProducer),
    eprMemberStates: eprProducer ? targetMemberStates : [],
    authorisedRepresentativeRequired,
    importerResponsibility,
    distributorResponsibility,
    manufacturerResponsibility: technicalConformityRoles.has("Manufacturer"),
    supplierDataObligation,
    marketplaceVerificationRelevant,
    fulfilmentVerificationRelevant,
    finalDistributorRelevant,
    noEuPlacingOnMarketRole: false,
    confidence: confidenceFromReviewFlags(reviewFlags),
    assumptions,
    keyObligations,
    dataRequired,
    recommendedActions: STANDARD_RECOMMENDED_ACTIONS,
    reviewFlags
  };
}
