import inventory from "@/data/data-inventory.json";
import { DataInventoryTable } from "@/components/inventory/DataInventoryTable";
import { Badge } from "@/components/ui/badge";
import type { DataInventoryRecord } from "@/lib/types";

export default function DataInventoryPage() {
  const records = inventory as unknown as DataInventoryRecord[];

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="ai">Data inventory</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">PPWR datapoint inventory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Searchable and filterable inventory for definitions, owners, interfaces, DQ checks, evidence, and status.
        </p>
      </div>
      <DataInventoryTable records={records} />
    </div>
  );
}
