import { ArrowRight } from "lucide-react";
import type { PpwrRoleScenario } from "@/lib/ppwr-role-types";

function stateLabel(memberState?: string) {
  return memberState ? ` (${memberState})` : "";
}

function getFlowNodes(scenario: PpwrRoleScenario) {
  if (scenario.exportOnlyOutsideEU) {
    return ["EU company", "Third-country customer", "Outside EU market"];
  }

  if (scenario.flowType === "marketplace") {
    return [
      `Producer / seller${stateLabel(scenario.companyMemberState)}`,
      "Online marketplace",
      `End users${scenario.targetMemberStates.length ? ` (${scenario.targetMemberStates.join(", ")})` : ""}`
    ];
  }

  if (scenario.flowType === "fulfilment") {
    return [
      `Producer / seller${stateLabel(scenario.companyMemberState)}`,
      "Fulfilment service provider",
      "End user"
    ];
  }

  if (scenario.flowType === "intra_group") {
    return [
      `Sending legal entity${stateLabel(scenario.companyMemberState)}`,
      `Receiving subsidiary${stateLabel(scenario.counterpartyMemberState)}`,
      "National market / end user"
    ];
  }

  if (scenario.flowType === "contract_manufacturing") {
    return ["Brand owner", "Contract manufacturer", "Market availability"];
  }

  if (scenario.flowType === "unpacking") {
    return ["Third-country supplier", `EU company unpacking${stateLabel(scenario.companyMemberState)}`, "Downstream flow"];
  }

  if (scenario.importsFromThirdCountry || scenario.flowType === "third_country_to_eu") {
    return scenario.companyEstablishedInEU
      ? ["Third-country supplier", `EU importer / company${stateLabel(scenario.companyMemberState)}`, "EU market"]
      : ["Non-EU seller", "EU end user", "EPR registration flow"];
  }

  if (scenario.onlyTransportOrLogistics) {
    return [
      `Goods owner${stateLabel(scenario.companyMemberState)}`,
      "Transport / logistics only",
      `Destination warehouse${stateLabel(scenario.counterpartyMemberState)}`
    ];
  }

  if (scenario.flowType === "intra_eu") {
    return [
      `Origin company${stateLabel(scenario.companyMemberState)}`,
      `Destination counterparty${stateLabel(scenario.counterpartyMemberState)}`,
      "Destination market"
    ];
  }

  return [
    `Packaging supplier${stateLabel(scenario.counterpartyMemberState)}`,
    `Brand owner / company${stateLabel(scenario.companyMemberState)}`,
    "Market availability"
  ];
}

export function ScenarioFlowDiagram({ scenario }: { scenario: PpwrRoleScenario }) {
  const nodes = getFlowNodes(scenario);

  return (
    <div className="overflow-x-auto rounded-lg border bg-slate-50 p-3">
      <div className="flex min-w-max items-center gap-2">
        {nodes.map((node, index) => (
          <div key={`${node}-${index}`} className="flex items-center gap-2">
            <div className="min-w-44 rounded-md border bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 shadow-sm">
              {node}
            </div>
            {index < nodes.length - 1 ? (
              <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
