"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Database, ListChecks, Network, TableProperties } from "lucide-react";
import scenariosJson from "@/data/ppwr-role-scenarios.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { assessPpwrRole } from "@/lib/ppwr-role-engine";
import type { PpwrRoleScenario } from "@/lib/ppwr-role-types";
import { RoleQuestionnaire } from "./RoleQuestionnaire";
import { RoleResponsibilityMatrix } from "./RoleResponsibilityMatrix";
import { RoleResultPanel } from "./RoleResultPanel";
import { ScenarioLibrary } from "./ScenarioLibrary";

type TabId = "library" | "guided" | "matrix" | "data";

const scenarios = scenariosJson as PpwrRoleScenario[];

const defaultCustomScenario: PpwrRoleScenario = {
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

const tabs: { id: TabId; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "library", label: "Scenario Library", icon: Network },
  { id: "guided", label: "Guided Assessment", icon: ListChecks },
  { id: "matrix", label: "Responsibility Matrix", icon: TableProperties },
  { id: "data", label: "Data Requirements", icon: Database }
];

export function RoleIdentifierWizard() {
  const [activeTab, setActiveTab] = useState<TabId>("library");
  const [selectedScenario, setSelectedScenario] = useState<PpwrRoleScenario>(scenarios[0]);
  const [customScenario, setCustomScenario] = useState<PpwrRoleScenario>(defaultCustomScenario);

  const assessment = useMemo(() => assessPpwrRole(selectedScenario), [selectedScenario]);

  function analyseScenario(scenario: PpwrRoleScenario) {
    setSelectedScenario(scenario);
  }

  function analyseCustomScenario() {
    setSelectedScenario(customScenario);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-lg border bg-white p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              type="button"
              variant={active ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="min-w-0"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,470px)]">
        <div className="min-w-0 space-y-4">
          {activeTab === "library" ? (
            <>
              <div>
                <Badge variant="ai">Preconfigured cases</Badge>
                <h2 className="mt-2 text-xl font-semibold tracking-normal">Scenario Library</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a packaging flow to see likely technical, EPR, supplier and gatekeeper roles.
                </p>
              </div>
              <ScenarioLibrary
                scenarios={scenarios}
                selectedScenarioId={selectedScenario.id}
                onAnalyse={analyseScenario}
              />
            </>
          ) : null}

          {activeTab === "guided" ? (
            <>
              <div>
                <Badge variant="ai">Custom scenario</Badge>
                <h2 className="mt-2 text-xl font-semibold tracking-normal">Guided Questionnaire</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Build a scenario from legal entity setup, geography, flow, ownership, branding and packaging handling.
                </p>
              </div>
              <RoleQuestionnaire
                scenario={customScenario}
                onChange={setCustomScenario}
                onAnalyse={analyseCustomScenario}
              />
            </>
          ) : null}

          {activeTab === "matrix" ? (
            <>
              <div>
                <Badge variant="ai">Role obligations</Badge>
                <h2 className="mt-2 text-xl font-semibold tracking-normal">Responsibility Matrix</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Compare the typical obligations associated with each role in the guided assessment.
                </p>
              </div>
              <RoleResponsibilityMatrix />
            </>
          ) : null}

          {activeTab === "data" ? (
            <>
              <div>
                <Badge variant="ai">Required evidence</Badge>
                <h2 className="mt-2 text-xl font-semibold tracking-normal">Data Requirements</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Map each likely role to the data needed for conformity, EPR registration, reporting and evidence collection.
                </p>
              </div>
              <RoleResponsibilityMatrix mode="data" />
            </>
          ) : null}
        </div>

        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <RoleResultPanel scenario={selectedScenario} assessment={assessment} />
        </aside>
      </div>
    </div>
  );
}
