"use client";

import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { applyGuidedScenarioAutoSettings } from "@/lib/ppwr-role-questionnaire";
import type { PpwrFlowType, PpwrPackagingType, PpwrRoleScenario } from "@/lib/ppwr-role-types";

type BooleanScenarioKey = {
  [K in keyof PpwrRoleScenario]-?: PpwrRoleScenario[K] extends boolean ? K : never;
}[keyof PpwrRoleScenario];

const flowTypes: PpwrFlowType[] = [
  "domestic",
  "intra_eu",
  "third_country_to_eu",
  "eu_to_third_country",
  "intra_group",
  "marketplace",
  "fulfilment",
  "contract_manufacturing",
  "private_label",
  "unpacking"
];

const packagingTypes: PpwrPackagingType[] = [
  "empty_packaging",
  "packaged_product",
  "service_packaging",
  "transport_packaging",
  "ecommerce_packaging",
  "mixed"
];

const questions: { key: BooleanScenarioKey; label: string }[] = [
  { key: "companyEstablishedInEU", label: "Is the company established in the EU?" },
  { key: "counterpartyEstablishedInEU", label: "Is the counterparty established in the EU?" },
  { key: "isIntraGroup", label: "Is the transaction intra-group rather than external?" },
  { key: "ownershipTransfers", label: "Does legal ownership transfer between entities?" },
  { key: "manufacturesPackaging", label: "Does the company manufacture packaging?" },
  { key: "manufacturesPackagedProduct", label: "Does the company manufacture a packaged product?" },
  { key: "sellsUnderOwnBrand", label: "Does the company sell under its own name or trademark?" },
  { key: "importsFromThirdCountry", label: "Does the company import packaging or packaged goods from outside the EU?" },
  { key: "firstMakesAvailableInMemberState", label: "Does the company first make the packaging or packaged product available in a Member State?" },
  { key: "sellsDirectlyToEndUsers", label: "Is the company selling directly to end users?" },
  { key: "sellsViaMarketplace", label: "Is the company selling via an online marketplace?" },
  { key: "fulfilmentProviderInvolved", label: "Is a fulfilment service provider involved?" },
  { key: "onlyTransportOrLogistics", label: "Is the company only transporting goods without transfer of ownership?" },
  { key: "unpacksWithoutBeingEndUser", label: "Does the company unpack packaged goods without being the end user?" },
  { key: "modifiesPackaging", label: "Does the company modify packaging before resale?" },
  { key: "privateLabelsOrRebrands", label: "Does the company rebrand or private-label packaged goods?" },
  { key: "exportOnlyOutsideEU", label: "Is the product export-only and not placed on the EU market?" }
];

function formatOption(value: string) {
  return value
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function parseMemberStates(value: string) {
  return value
    .split(",")
    .map((memberState) => memberState.trim().toUpperCase())
    .filter(Boolean);
}

export function RoleQuestionnaire({
  scenario,
  onChange,
  onAnalyse
}: {
  scenario: PpwrRoleScenario;
  onChange: (scenario: PpwrRoleScenario) => void;
  onAnalyse: () => void;
}) {
  function update<K extends keyof PpwrRoleScenario>(key: K, value: PpwrRoleScenario[K]) {
    onChange({ ...scenario, [key]: value });
  }

  function updateWithAutoSettings<K extends Parameters<typeof applyGuidedScenarioAutoSettings>[1]>(
    key: K,
    value: PpwrRoleScenario[K]
  ) {
    onChange(applyGuidedScenarioAutoSettings({ ...scenario, [key]: value }, key));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-blue-600" aria-hidden="true" />
          <CardTitle>Guided assessment</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            onAnalyse();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium">Scenario title</span>
              <Input value={scenario.title} onChange={(event) => update("title", event.target.value)} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Flow type</span>
              <Select
                value={scenario.flowType}
                onChange={(event) => updateWithAutoSettings("flowType", event.target.value as PpwrFlowType)}
                className="w-full"
              >
                {flowTypes.map((flowType) => (
                  <option key={flowType} value={flowType}>
                    {formatOption(flowType)}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Packaging type</span>
              <Select
                value={scenario.packagingType}
                onChange={(event) => updateWithAutoSettings("packagingType", event.target.value as PpwrPackagingType)}
                className="w-full"
              >
                {packagingTypes.map((packagingType) => (
                  <option key={packagingType} value={packagingType}>
                    {formatOption(packagingType)}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Company Member State</span>
              <Input
                value={scenario.companyMemberState ?? ""}
                placeholder="DE"
                onChange={(event) => updateWithAutoSettings("companyMemberState", event.target.value.toUpperCase() || undefined)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Counterparty Member State</span>
              <Input
                value={scenario.counterpartyMemberState ?? ""}
                placeholder="FR"
                onChange={(event) => updateWithAutoSettings("counterpartyMemberState", event.target.value.toUpperCase() || undefined)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Target Member States</span>
              <Input
                value={scenario.targetMemberStates.join(", ")}
                placeholder="DE, FR, AT"
                onChange={(event) => updateWithAutoSettings("targetMemberStates", parseMemberStates(event.target.value))}
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {questions.map((question) => (
              <label
                key={question.key}
                className="flex min-h-14 items-start gap-3 rounded-md border bg-white p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={Boolean(scenario[question.key])}
                  onChange={(event) => update(question.key, event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="leading-5 text-slate-700">{question.label}</span>
              </label>
            ))}
          </div>

          <Button type="submit" className="w-full md:w-auto">
            Analyse custom scenario
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
