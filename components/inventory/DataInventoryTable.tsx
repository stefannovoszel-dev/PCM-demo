"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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
      { accessorKey: "record_id", header: "Record ID" },
      { accessorKey: "data_domain", header: "Data Domain" },
      { accessorKey: "datapoint", header: "Datapoint" },
      { accessorKey: "definition", header: "Definition" },
      { accessorKey: "legal_reference", header: "Legal Reference" },
      {
        accessorKey: "required",
        header: "Required",
        cell: ({ row }) => (row.original.required ? "Yes" : "No")
      },
      { accessorKey: "granularity", header: "Granularity" },
      { accessorKey: "role_steward", header: "Role / Steward" },
      { accessorKey: "primary_source_system", header: "Primary Source System" },
      { accessorKey: "source_object", header: "Source Object" },
      { accessorKey: "system_owner", header: "System Owner" },
      { accessorKey: "data_owner", header: "Data Owner" },
      { accessorKey: "upstream_interface_type", header: "Upstream Interface Type" },
      { accessorKey: "downstream_interface_type", header: "Downstream Interface Type" },
      { accessorKey: "refresh_frequency", header: "Refresh Frequency" },
      { accessorKey: "access_level", header: "Access Level" },
      { accessorKey: "completeness_rating", header: "Completeness Rating" },
      { accessorKey: "accuracy_rating", header: "Accuracy Rating" },
      { accessorKey: "traceability_rating", header: "Traceability Rating" },
      { accessorKey: "dq_score", header: "DQ Score" },
      {
        accessorKey: "dq_checks",
        header: "DQ Checks",
        cell: ({ row }) => row.original.dq_checks.join(", ")
      },
      {
        accessorKey: "evidence_link",
        header: "Evidence Link",
        cell: ({ row }) => row.original.evidence_link ?? "None"
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
      },
      { accessorKey: "notes", header: "Notes" }
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <Card className="overflow-hidden">
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
      <div className="thin-scrollbar overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="max-w-72 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
