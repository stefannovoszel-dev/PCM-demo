export const PPWR_ROLES = [
  "Manufacturer",
  "Importer",
  "Distributor",
  "Producer for EPR",
  "Supplier",
  "Authorised Representative for EPR",
  "Final Distributor",
  "Fulfilment Service Provider",
  "Online Marketplace",
  "No EU placing-on-market role",
  "Review Required"
] as const;

export type PpwrRole = (typeof PPWR_ROLES)[number];
export type PpwrRoleAppliesTo = "Company" | "Counterparty" | "Target";

export interface PpwrRoleAssignment {
  role: PpwrRole;
  appliesTo: PpwrRoleAppliesTo;
  explanation: string;
}

export type PpwrFlowType =
  | "domestic"
  | "intra_eu"
  | "third_country_to_eu"
  | "eu_to_third_country"
  | "intra_group"
  | "marketplace"
  | "fulfilment"
  | "contract_manufacturing"
  | "private_label"
  | "unpacking";

export type PpwrPackagingType =
  | "empty_packaging"
  | "packaged_product"
  | "service_packaging"
  | "transport_packaging"
  | "ecommerce_packaging"
  | "mixed";

export interface PpwrRoleScenario {
  id: string;
  title: string;
  description: string;
  flowType: PpwrFlowType;
  companyEstablishedInEU: boolean;
  companyMemberState?: string;
  counterpartyEstablishedInEU: boolean;
  counterpartyMemberState?: string;
  isIntraGroup: boolean;
  ownershipTransfers: boolean;
  manufacturesPackaging: boolean;
  manufacturesPackagedProduct: boolean;
  sellsUnderOwnBrand: boolean;
  importsFromThirdCountry: boolean;
  firstMakesAvailableInMemberState: boolean;
  sellsDirectlyToEndUsers: boolean;
  sellsViaMarketplace: boolean;
  fulfilmentProviderInvolved: boolean;
  onlyTransportOrLogistics: boolean;
  unpacksWithoutBeingEndUser: boolean;
  modifiesPackaging: boolean;
  privateLabelsOrRebrands: boolean;
  exportOnlyOutsideEU: boolean;
  packagingType: PpwrPackagingType;
  targetMemberStates: string[];
}

export interface PpwrRoleAssessment {
  scenarioId?: string;
  likelyRoles: PpwrRole[];
  roleAssignments: PpwrRoleAssignment[];
  technicalConformityRole: PpwrRole[];
  eprProducer: boolean;
  eprResponsibleParty: string;
  eprMemberStates: string[];
  authorisedRepresentativeRequired: boolean;
  importerResponsibility: boolean;
  distributorResponsibility: boolean;
  manufacturerResponsibility: boolean;
  supplierDataObligation: boolean;
  marketplaceVerificationRelevant: boolean;
  fulfilmentVerificationRelevant: boolean;
  finalDistributorRelevant: boolean;
  noEuPlacingOnMarketRole: boolean;
  confidence: "high" | "medium" | "low";
  assumptions: string[];
  keyObligations: string[];
  dataRequired: string[];
  recommendedActions: string[];
  reviewFlags: string[];
}

export interface PpwrRoleResponsibility {
  role: PpwrRole;
  responsibilityGroup:
    | "Technical conformity"
    | "EPR / producer responsibility"
    | "Data provider"
    | "Verification / gatekeeper"
    | "Distribution";
  responsibilities: string[];
  dataRequirements: string[];
}
