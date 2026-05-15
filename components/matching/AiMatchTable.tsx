"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MatchActionButtons } from "./MatchActionButtons";
import type { AiMatchCandidate } from "@/lib/types";

function confidenceVariant(score: number) {
  if (score >= 90) return "success";
  if (score >= 70) return "warning";
  return "destructive";
}

export function AiMatchTable({
  candidates,
  onSelect
}: {
  candidates: AiMatchCandidate[];
  onSelect: (candidate: AiMatchCandidate) => void;
}) {
  const [selectedId, setSelectedId] = useState(candidates[0]?.id);

  const columns = useMemo<ColumnDef<AiMatchCandidate>[]>(
    () => [
      {
        header: "Candidate A",
        cell: ({ row }) => row.original.candidate_a.component_name
      },
      {
        header: "Candidate B",
        cell: ({ row }) => row.original.candidate_b.component_name
      },
      {
        accessorKey: "confidence",
        header: "AI confidence",
        cell: ({ row }) => <Badge variant={confidenceVariant(row.original.confidence)}>{row.original.confidence}%</Badge>
      },
      { accessorKey: "reason", header: "Reason" },
      { accessorKey: "suggested_canonical_name", header: "Suggested canonical name" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant="ai">{row.original.status}</Badge>
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <MatchActionButtons id={row.original.id} />
      }
    ],
    []
  );

  const table = useReactTable({
    data: candidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <Card className="overflow-hidden">
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
              <TableRow
                key={row.id}
                className={selectedId === row.original.id ? "bg-blue-50" : undefined}
                onClick={() => {
                  setSelectedId(row.original.id);
                  onSelect(row.original);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="max-w-80 align-top">
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
