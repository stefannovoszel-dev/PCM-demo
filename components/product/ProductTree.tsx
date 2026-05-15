import { Box, Package, PackageCheck } from "lucide-react";
import type { PackagingComponent, Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function ProductTree({
  product,
  components,
  selectedId,
  onSelect
}: {
  product: Product;
  components: PackagingComponent[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
        <PackageCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{product.product_name}</p>
          <p className="text-xs text-muted-foreground">{product.packaging_id}</p>
        </div>
      </div>
      <div className="ml-5 mt-3 border-l pl-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <Package className="h-4 w-4" aria-hidden="true" />
          Packaging System
        </div>
        <div className="space-y-2">
          {components.map((component) => (
            <button
              key={component.component_id}
              type="button"
              onClick={() => onSelect?.(component.component_id)}
              className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                selectedId === component.component_id ? "border-blue-300 bg-blue-50" : "bg-white hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Box className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {component.component_name}
              </span>
              <Badge variant={component.missing_fields.length ? "warning" : "success"}>
                {component.missing_fields.length ? `${component.missing_fields.length} gaps` : "complete"}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
