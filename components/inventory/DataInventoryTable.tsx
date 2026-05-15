"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnSizingState
} from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryFilters } from "./InventoryFilters";
import type { DataInventoryRecord } from "@/lib/types";

function statusVariant(status: DataInventoryRecord["status"]) {
  if (status === "Complete") return "success";
  if (status === "Missing") return "destructive";
  return "warning";
}

export function DataInventoryTable({ records }: { records: DataInventoryRecord[] }) {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [status, setStatus] = useState("All");
  const [required, setRequired] = useState("All");
  const [dqBand, setDqBand] = useState("All");
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch = JSON.stringify(record).toLowerCase().includes(search.toLowerCase());
        const matchesDomain = domain === "All" || record.data_domain === domain;
        const matchesStatus = status === "All" || record.status === status;
        const matchesRequired =
          required === "All" || (required === "Yes" ? record.required : !record.required);
        const matchesDq =
          dqBand === "All" ||
          (dqBand === "90+" && record.dq_score >= 90) ||
          (dqBand === "70-89" && record.dq_score >= 70 && record.dq_score < 90) ||
          (dqBand === "Below 70" && record.dq_score < 70);
        return matchesSearch && matchesDomain && matchesStatus && matchesRequired && matchesDq;
      }),
    [domain, dqBand, records, required, search, status]
  );

  const columns = useMemo<ColumnDef<DataInventoryRecord>[]>(
    () => [
      { accessorKey: "record_id", header: "Record ID", size: 130 },
      { accessorKey: "data_domain", header: "Data Domain", size: 180 },
      { accessorKey: "datapoint", header: "Datapoint", size: 220 },
      { accessorKey: "definition", header: "Definition", size: 360, minSize: 220, maxSize: 640 },
      { accessorKey: "legal_reference", header: "Legal Reference", size: 220 },
      {
        accessorKey: "required",
        header: "Required",
        size: 110,
        cell: ({ row }) => (row.original.required ? "Yes" : "No")
      },
      { accessorKey: "granularity", header: "Granularity", size: 160 },
      { accessorKey: "role_steward", header: "Role / Steward", size: 200 },
      { accessorKey: "primary_source_system", header: "Primary Source System", size: 220 },
      { accessorKey: "source_object", header: "Source Object", size: 180 },
      { accessorKey: "system_owner", header: "System Owner", size: 180 },
      { accessorKey: "data_owner", header: "Data Owner", size: 180 },
      { accessorKey: "upstream_interface_type", header: "Upstream Interface Type", size: 230 },
      { accessorKey: "downstream_interface_type", header: "Downstream Interface Type", size: 250 },
      { accessorKey: "refresh_frequency", header: "Refresh Frequency", size: 180 },
      { accessorKey: "access_level", header: "Access Level", size: 160 },
      { accessorKey: "completeness_rating", header: "Completeness Rating", size: 190 },
      { accessorKey: "accuracy_rating", header: "Accuracy Rating", size: 170 },
      { accessorKey: "traceability_rating", header: "Traceability Rating", size: 190 },
      { accessorKey: "dq_score", header: "DQ Score", size: 120 },
      {
        accessorKey: "dq_checks",
        header: "DQ Checks",
        size: 300,
        minSize: 180,
        maxSize: 560,
        cell: ({ row }) => row.original.dq_checks.join(", ")
      },
      {
        accessorKey: "evidence_link",
        header: "Evidence Link",
        size: 180,
        cell: ({ row }) => row.original.evidence_link ?? "None"
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
      },
      { accessorKey: "notes", header: "Notes", size: 320, minSize: 180, maxSize: 620 }
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: {
      columnSizing
    },
    defaultColumn: {
      minSize: 90,
      size: 180,
      maxSize: 520
    },
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b">
        <InventoryFilters
          search={search}
          setSearch={setSearch}
          domain={domain}
          setDomain={setDomain}
          status={status}
          setStatus={setStatus}
          required={required}
          setRequired={setRequired}
          dqBand={dqBand}
          setDqBand={setDqBand}
        />
        <div className="flex justify-end px-4 pb-4">
          <Button type="button" variant="outline" size="sm" onClick={() => setColumnSizing({})}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset widths
          </Button>
        </div>
      </div>
      <div className="thin-scrollbar overflow-x-auto">
        <Table className="table-fixed" style={{ width: table.getTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="relative select-none whitespace-nowrap pr-5"
                    style={{ width: header.getSize() }}
                  >
                    <div className="overflow-hidden text-ellipsis">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                    {header.column.getCanResize() ? (
                      <div
                        role="separator"
                        aria-label={`Resize ${header.column.id} column`}
                        aria-orientation="vertical"
                        title="Resize column"
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none select-none"
                      >
                        <span className="absolute right-0 top-2 h-[calc(100%-1rem)] w-px bg-slate-200 transition-colors hover:bg-blue-500" />
                      </div>
                    ) : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap" style={{ width: cell.column.getSize() }}>
                    <div className="overflow-hidden text-ellipsis">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
