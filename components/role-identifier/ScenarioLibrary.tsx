import { assessPpwrRole } from "@/lib/ppwr-role-engine";
import type { PpwrRoleScenario } from "@/lib/ppwr-role-types";
import { ScenarioCard } from "./ScenarioCard";

export function ScenarioLibrary({
  scenarios,
  selectedScenarioId,
  onAnalyse
}: {
  scenarios: PpwrRoleScenario[];
  selectedScenarioId?: string;
  onAnalyse: (scenario: PpwrRoleScenario) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {scenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          assessment={assessPpwrRole(scenario)}
          selected={scenario.id === selectedScenarioId}
          onAnalyse={() => onAnalyse(scenario)}
        />
      ))}
    </div>
  );
}
