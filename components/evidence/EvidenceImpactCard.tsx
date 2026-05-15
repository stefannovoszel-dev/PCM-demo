import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvidenceEvent, ScoreChange } from "@/lib/evidence-types";
import type { PackagingComponent, Product } from "@/lib/types";

function value(value?: number) {
  return value === undefined ? "Pending" : `${value}%`;
}

export function EvidenceImpactCard({
  event,
  scoreChange,
  product,
  component
}: {
  event?: EvidenceEvent;
  scoreChange?: ScoreChange;
  product?: Product;
  component?: PackagingComponent;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <CardTitle>Evidence impact</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Affected product", product?.product_name ?? event?.product_id ?? "Not selected"],
            ["Affected component", component?.component_name ?? event?.component_id ?? "Product-level evidence"],
            ["Previous component score", value(scoreChange?.previous_component_score)],
            ["New component score", value(scoreChange?.new_component_score)],
            ["Previous readiness", value(scoreChange?.previous_overall_readiness)],
            ["New readiness", value(scoreChange?.new_overall_readiness)],
            ["Delta", scoreChange ? `${scoreChange.delta >= 0 ? "+" : ""}${scoreChange.delta} pts` : "Pending"],
            ["Changed fields", scoreChange?.changed_fields.join(", ") || Object.keys(event?.field_updates ?? {}).join(", ") || "None"]
          ].map(([label, item]) => (
            <div key={label} className="rounded-md border bg-slate-50 p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{item}</p>
            </div>
          ))}
        </div>
        <div className="rounded-md border bg-white p-3">
          <p className="text-xs text-muted-foreground">Reason</p>
          <p className="mt-1 text-sm text-slate-700">
            {scoreChange?.reason ??
              event?.impact_summary ??
              "Select or process an event to view impact."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
