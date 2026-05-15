import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PackagingComponent } from "@/lib/types";

export function ComponentDetailPanel({ component }: { component: PackagingComponent }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{component.component_name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{component.component_id}</p>
          </div>
          <Badge variant={component.missing_fields.length ? "warning" : "success"}>
            {component.missing_fields.length ? "Review" : "Ready"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Packaging ID", component.packaging_id],
            ["Canonical name", component.canonical_component_name ?? component.component_name],
            ["Material", component.material],
            ["Weight", `${component.weight_g} g`],
            ["Supplier", `${component.supplier_name} (${component.supplier_id})`],
            ["Recycled content", component.recycled_content_percent === null ? "Missing" : `${component.recycled_content_percent}%`],
            ["Recyclability grade", component.recyclability_grade ?? "Missing"],
            ["Certificate", component.certificate_id ?? "Missing"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border bg-slate-50 p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Aliases</p>
          <div className="flex flex-wrap gap-2">
            {component.aliases.map((alias) => (
              <Badge key={alias} variant="outline">
                {alias}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Missing fields and evidence gaps</p>
          <div className="flex flex-wrap gap-2">
            {component.missing_fields.length ? (
              component.missing_fields.map((field) => (
                <Badge key={field} variant="warning">
                  {field}
                </Badge>
              ))
            ) : (
              <Badge variant="success">No open gaps</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
