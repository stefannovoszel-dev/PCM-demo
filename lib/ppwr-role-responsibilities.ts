import type { PpwrRole, PpwrRoleResponsibility } from "./ppwr-role-types";

export const PPWR_ROLE_RESPONSIBILITIES: PpwrRoleResponsibility[] = [
  {
    role: "Manufacturer",
    responsibilityGroup: "Technical conformity",
    responsibilities: [
      "conformity assessment",
      "technical documentation",
      "EU Declaration of Conformity",
      "packaging design requirements",
      "labelling where applicable",
      "documentation retention",
      "supplier evidence collection"
    ],
    dataRequirements: [
      "packaging specification",
      "bill of materials",
      "component materials",
      "weight per component",
      "recyclability assessment",
      "recycled content evidence",
      "substances information",
      "technical documentation",
      "EU Declaration of Conformity"
    ]
  },
  {
    role: "Importer",
    responsibilityGroup: "Technical conformity",
    responsibilities: [
      "verify manufacturer conformity documentation",
      "verify required labelling and identification",
      "ensure packaging is compliant before placing on EU market",
      "keep/provide documents where required",
      "may be EPR producer if first making available"
    ],
    dataRequirements: [
      "importer of record",
      "third-country supplier",
      "conformity documentation availability",
      "manufacturer identity",
      "packaging identification",
      "customs/import flow",
      "first EU Member State of availability"
    ]
  },
  {
    role: "Distributor",
    responsibilityGroup: "Distribution",
    responsibilities: [
      "due care before making available",
      "verify producer registration where relevant",
      "verify labelling and identification",
      "do not make non-compliant packaging available",
      "may become manufacturer if rebranding/modifying",
      "may be EPR producer if first making available"
    ],
    dataRequirements: [
      "upstream producer registration",
      "labelling check",
      "supplier/manufacturer identity",
      "evidence that packaging is compliant",
      "first making available check"
    ]
  },
  {
    role: "Producer for EPR",
    responsibilityGroup: "EPR / producer responsibility",
    responsibilities: [
      "register in each relevant Member State",
      "report packaging placed/made available",
      "provide EPR information",
      "pay EPR fees/financial contributions",
      "mandate PRO where used",
      "appoint authorised representative where required",
      "maintain data by packaging material/category/weight"
    ],
    dataRequirements: [
      "legal entity",
      "Member State",
      "registration number",
      "packaging category",
      "packaging material",
      "packaging weight",
      "units placed/made available",
      "household/commercial classification where applicable",
      "PRO mandate",
      "authorised representative data",
      "reporting period"
    ]
  },
  {
    role: "Supplier",
    responsibilityGroup: "Data provider",
    responsibilities: [
      "provide material and packaging data",
      "provide declarations/certificates",
      "provide composition, recycled content and recyclability evidence",
      "notify changes"
    ],
    dataRequirements: [
      "material declarations",
      "certificates",
      "recycled content evidence",
      "recyclability data",
      "change notifications"
    ]
  },
  {
    role: "Authorised Representative for EPR",
    responsibilityGroup: "EPR / producer responsibility",
    responsibilities: [
      "fulfil EPR obligations in Member State on behalf of producer according to mandate",
      "support registration and reporting",
      "communicate with competent authorities"
    ],
    dataRequirements: [
      "producer mandate",
      "authorised representative legal entity",
      "Member State scope",
      "registration references",
      "authority communications"
    ]
  },
  {
    role: "Final Distributor",
    responsibilityGroup: "Distribution",
    responsibilities: [
      "consumer-facing delivery obligations where relevant",
      "refill/reuse obligations where applicable",
      "may be producer if first making available"
    ],
    dataRequirements: [
      "consumer delivery channel",
      "final end-user status",
      "refill/reuse applicability",
      "first making available check"
    ]
  },
  {
    role: "Fulfilment Service Provider",
    responsibilityGroup: "Verification / gatekeeper",
    responsibilities: [
      "verification relevance",
      "ensure handling does not compromise compliance",
      "support producer information checks where applicable"
    ],
    dataRequirements: [
      "fulfilment provider identity",
      "warehousing/packing/dispatch scope",
      "producer registration evidence",
      "handling instructions"
    ]
  },
  {
    role: "Online Marketplace",
    responsibilityGroup: "Verification / gatekeeper",
    responsibilities: [
      "obtain producer registration and self-certification information where required",
      "verification/gatekeeper relevance",
      "producer remains responsible for accuracy"
    ],
    dataRequirements: [
      "marketplace operator",
      "producer registration number",
      "self-certification status",
      "target Member States",
      "seller legal entity"
    ]
  }
];

export const ROLE_RESPONSIBILITY_ITEMS: Partial<Record<PpwrRole, string[]>> =
  PPWR_ROLE_RESPONSIBILITIES.reduce<Partial<Record<PpwrRole, string[]>>>(
    (items, responsibility) => ({
      ...items,
      [responsibility.role]: responsibility.responsibilities
    }),
    {}
  );

export const ROLE_DATA_REQUIREMENTS: Partial<Record<PpwrRole, string[]>> =
  PPWR_ROLE_RESPONSIBILITIES.reduce<Partial<Record<PpwrRole, string[]>>>(
    (items, responsibility) => ({
      ...items,
      [responsibility.role]: responsibility.dataRequirements
    }),
    {}
  );
