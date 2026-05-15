import { AlertTriangle, CheckCircle2, FileText, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge } from "./RoleBadge";
import { RoleDecisionTree } from "./RoleDecisionTree";
import { ScenarioFlowDiagram } from "./ScenarioFlowDiagram";
import type {
  PpwrRole,
  PpwrRoleAssignment,
  PpwrRoleAssessment,
  PpwrRoleScenario
} from "@/lib/ppwr-role-types";

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

function SummaryItem({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
        ? "text-amber-800"
        : "text-slate-950";

  return (
    <div className="rounded-md border bg-white p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function RoleList({ roles }: { roles: PpwrRole[] }) {
  if (roles.length === 0) {
    return <span className="text-sm text-muted-foreground">None assigned by this demo logic</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((role) => (
        <RoleBadge key={role} role={role} />
      ))}
    </div>
  );
}

const roleAssignmentGroups: Array<{
  appliesTo: PpwrRoleAssignment["appliesTo"];
  description: string;
}> = [
  { appliesTo: "Company", description: "Assessed legal entity" },
  {
    appliesTo: "Counterparty",
    description: "Supplier, distributor, subsidiary, marketplace or fulfilment partner"
  },
  { appliesTo: "Target", description: "Target Member State or market flow" }
];

function RoleAssignmentList({ assignments }: { assignments: PpwrRoleAssignment[] }) {
  if (assignments.length === 0) {
    return <span className="text-sm text-muted-foreground">None assigned by this demo logic</span>;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {roleAssignmentGroups.map((group) => {
        const groupAssignments = assignments.filter((assignment) => assignment.appliesTo === group.appliesTo);

        return (
          <div key={group.appliesTo} className="rounded-md border bg-white p-3">
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-900">{group.appliesTo}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{group.description}</p>
            </div>

            {groupAssignments.length ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {groupAssignments.map((assignment) => (
                    <RoleBadge key={`${assignment.role}-${assignment.explanation}`} role={assignment.role} />
                  ))}
                </div>
                <ul className="grid gap-1.5 text-xs leading-relaxed text-slate-600">
                  {groupAssignments.map((assignment) => (
                    <li key={`${assignment.role}-${assignment.explanation}`}>
                      <span className="font-medium text-slate-700">{assignment.role}:</span>{" "}
                      {assignment.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No likely role mapped.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      {items.length ? (
        <ul className="mt-2 grid gap-2 text-sm text-slate-600">
          {items.map((item) => (
            <li key={item} className="rounded-md border bg-white px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No items generated for this assessment.</p>
      )}
    </div>
  );
}

export function RoleResultPanel({
  scenario,
  assessment
}: {
  scenario: PpwrRoleScenario;
  assessment: PpwrRoleAssessment;
}) {
  const technicalOwner = assessment.technicalConformityRole.length
    ? assessment.technicalConformityRole.join(", ")
    : "Not assigned";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Result panel</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{scenario.title}</p>
            </div>
            <Badge
              variant={
                assessment.confidence === "high"
                  ? "success"
                  : assessment.confidence === "medium"
                    ? "warning"
                    : "destructive"
              }
            >
              {assessment.confidence} confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryItem
              label="Likely EPR Producer"
              value={assessment.eprProducer ? assessment.eprResponsibleParty : "No"}
              tone={assessment.eprProducer ? "success" : "default"}
            />
            <SummaryItem label="Technical Conformity Owner" value={technicalOwner} />
            <SummaryItem label="Importer?" value={yesNo(assessment.importerResponsibility)} />
            <SummaryItem
              label="Authorised Representative Required?"
              value={yesNo(assessment.authorisedRepresentativeRequired)}
              tone={assessment.authorisedRepresentativeRequired ? "warning" : "default"}
            />
            <SummaryItem
              label="Member States affected"
              value={assessment.eprMemberStates.length ? assessment.eprMemberStates.join(", ") : "None identified"}
            />
            <SummaryItem
              label="Review flags"
              value={assessment.reviewFlags.length ? `${assessment.reviewFlags.length} flag(s)` : "None"}
              tone={assessment.reviewFlags.length ? "warning" : "success"}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Likely role(s)</p>
            <RoleAssignmentList assignments={assessment.roleAssignments} />
          </div>

          <ScenarioFlowDiagram scenario={scenario} />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h3 className="text-sm font-semibold">A. Technical conformity role</h3>
              </div>
              <RoleList roles={assessment.technicalConformityRole} />
              <div className="mt-3 grid gap-1 text-xs text-slate-600">
                <span>Manufacturer conformity responsibility: {yesNo(assessment.manufacturerResponsibility)}</span>
                <span>Importer responsibility: {yesNo(assessment.importerResponsibility)}</span>
                <span>Distributor responsibility: {yesNo(assessment.distributorResponsibility)}</span>
              </div>
            </div>

            <div className="rounded-md border bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <h3 className="text-sm font-semibold">B. EPR / producer-responsibility role</h3>
              </div>
              <p className="text-sm text-slate-700">{assessment.eprResponsibleParty}</p>
              <div className="mt-3 grid gap-1 text-xs text-slate-600">
                <span>EPR producer: {yesNo(assessment.eprProducer)}</span>
                <span>Authorised representative: {yesNo(assessment.authorisedRepresentativeRequired)}</span>
              </div>
            </div>

            <div className="rounded-md border bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-700" aria-hidden="true" />
                <h3 className="text-sm font-semibold">C. Data-provider role</h3>
              </div>
              <p className="text-sm text-slate-700">
                Supplier data obligation: {yesNo(assessment.supplierDataObligation)}
              </p>
            </div>

            <div className="rounded-md border bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                {assessment.marketplaceVerificationRelevant || assessment.fulfilmentVerificationRelevant ? (
                  <AlertTriangle className="h-4 w-4 text-amber-700" aria-hidden="true" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-400" aria-hidden="true" />
                )}
                <h3 className="text-sm font-semibold">D. Verification/gatekeeper role</h3>
              </div>
              <div className="grid gap-1 text-sm text-slate-700">
                <span>Marketplace verification: {yesNo(assessment.marketplaceVerificationRelevant)}</span>
                <span>Fulfilment verification: {yesNo(assessment.fulfilmentVerificationRelevant)}</span>
                <span>Final distributor relevance: {yesNo(assessment.finalDistributorRelevant)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoleDecisionTree scenario={scenario} assessment={assessment} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ListBlock title="Key obligations" items={assessment.keyObligations} />
        <ListBlock title="Data required" items={assessment.dataRequired} />
        <ListBlock title="Recommended next actions" items={assessment.recommendedActions} />
        <ListBlock title="Assumptions" items={assessment.assumptions} />
      </div>

      {assessment.reviewFlags.length ? <ListBlock title="Review flags" items={assessment.reviewFlags} /> : null}
    </div>
  );
}
