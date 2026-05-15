"use client";

import inventory from "@/data/data-inventory.json";
import { DataInventoryTable } from "@/components/inventory/DataInventoryTable";
import { Badge } from "@/components/ui/badge";
import { useDemoState } from "@/lib/demo-state";
import { deriveDataInventoryRecords } from "@/lib/data-inventory";
import type { DataInventoryRecord } from "@/lib/types";

export default function DataInventoryPage() {
  const { components, evidenceDocuments, auditEvents } = useDemoState();
  const records = deriveDataInventoryRecords(
    inventory as unknown as DataInventoryRecord[],
    components,
    evidenceDocuments,
    auditEvents
  );

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="ai">Data inventory</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">PPWR datapoint inventory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Searchable inventory recalculated from live components, applied evidence documents, audit events, and DQ checks.
        </p>
      </div>
      <DataInventoryTable records={records} />
    </div>
  );
}
