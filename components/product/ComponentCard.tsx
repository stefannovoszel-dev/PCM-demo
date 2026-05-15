import { AlertTriangle, CheckCircle2, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PackagingComponent } from "@/lib/types";

export function ComponentCard({
  component,
  onSelect
}: {
  component: PackagingComponent;
  onSelect?: (id: string) => void;
}) {
  const hasGaps = component.missing_fields.length > 0;

  return (
    <button type="button" onClick={() => onSelect?.(component.component_id)} className="text-left">
      <Card className="h-full transition-colors hover:border-blue-300 hover:bg-blue-50/40">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{component.component_name}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{component.supplier_name}</p>
            </div>
            {hasGaps ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={component.material === "PE-HD" ? "warning" : "secondary"}>
              {component.material}
            </Badge>
            <Badge variant={component.certificate_status === "Valid" ? "success" : "warning"}>
              {component.certificate_status}
            </Badge>
            <Badge variant={component.supplier_confirmed ? "success" : "outline"}>
              {component.supplier_confirmed ? "confirmed" : "unconfirmed"}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Weight</p>
              <p className="font-semibold">{component.weight_g} g</p>
            </div>
            <div>
              <p className="text-muted-foreground">Recycled</p>
              <p className="font-semibold">
                {component.recycled_content_percent === null ? "Missing" : `${component.recycled_content_percent}%`}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">DQ</p>
              <p className="font-semibold">{component.data_quality_score}%</p>
            </div>
          </div>
          {hasGaps ? (
            <p className="flex items-center gap-2 text-xs text-amber-700">
              <FileWarning className="h-4 w-4" aria-hidden="true" />
              {component.missing_fields.slice(0, 2).join(", ")}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </button>
  );
}
