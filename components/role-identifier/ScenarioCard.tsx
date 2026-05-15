import { ArrowRight, Globe2, Network, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "./RoleBadge";
import type { PpwrRoleAssessment, PpwrRoleScenario } from "@/lib/ppwr-role-types";

function formatFlowType(flowType: PpwrRoleScenario["flowType"]) {
  return flowType
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function partyLabel(isEu: boolean, memberState?: string) {
  return isEu ? `EU${memberState ? ` / ${memberState}` : ""}` : "Non-EU";
}

export function ScenarioCard({
  scenario,
  assessment,
  selected,
  onAnalyse
}: {
  scenario: PpwrRoleScenario;
  assessment: PpwrRoleAssessment;
  selected: boolean;
  onAnalyse: () => void;
}) {
  return (
    <Card className={selected ? "border-blue-300 bg-blue-50/50" : "bg-white"}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm">{scenario.title}</CardTitle>
          <Badge variant={selected ? "ai" : "outline"}>{formatFlowType(scenario.flowType)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="min-h-12 text-sm leading-5 text-muted-foreground">{scenario.description}</p>

        <div className="grid gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>
              Company: {partyLabel(scenario.companyEstablishedInEU, scenario.companyMemberState)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Network className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>
              Counterparty: {partyLabel(scenario.counterpartyEstablishedInEU, scenario.counterpartyMemberState)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>
              Target: {scenario.targetMemberStates.length ? scenario.targetMemberStates.join(", ") : "Outside EU / none"}
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Likely PPWR roles</p>
          <div className="flex flex-wrap gap-1.5">
            {assessment.likelyRoles.slice(0, 5).map((role) => (
              <RoleBadge key={role} role={role} />
            ))}
            {assessment.likelyRoles.length > 5 ? (
              <Badge variant="secondary">+{assessment.likelyRoles.length - 5}</Badge>
            ) : null}
          </div>
        </div>

        <Button type="button" variant={selected ? "default" : "outline"} onClick={onAnalyse} className="w-full">
          Analyse scenario
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
}
