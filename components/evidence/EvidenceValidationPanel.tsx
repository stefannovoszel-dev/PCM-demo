import { CheckCircle2, CircleAlert, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceStatusBadge } from "./EvidenceBadge";
import type { EvidenceValidationCheck, EvidenceValidationResult } from "@/lib/evidence-types";

function CheckIcon({ check }: { check: EvidenceValidationCheck }) {
  if (check.status === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
  if (check.status === "warning") return <CircleAlert className="h-4 w-4 text-amber-600" aria-hidden="true" />;
  return <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />;
}

export function EvidenceValidationPanel({ validation }: { validation?: EvidenceValidationResult }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Validation panel</CardTitle>
          {validation ? <EvidenceStatusBadge status={validation.status} /> : null}
        </div>
      </CardHeader>
      <CardContent>
        {validation ? (
          <div className="space-y-3">
            {validation.checks.map((check) => (
              <div key={check.id} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 rounded-md border bg-white p-3">
                <CheckIcon check={check} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{check.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{check.message}</p>
                </div>
              </div>
            ))}
            <div className="rounded-md border bg-slate-50 p-3 text-sm">
              Final decision: {validation.canAutoApply ? "auto-apply allowed" : "manual action or rejection required"}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select an evidence event to preview validation checks.</p>
        )}
      </CardContent>
    </Card>
  );
}
