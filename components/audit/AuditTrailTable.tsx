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
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditEvent } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function AuditTrailTable({
  events,
  compact = false
}: {
  events: AuditEvent[];
  compact?: boolean;
}) {
  const [filter, setFilter] = useState("");
  const [actor, setActor] = useState("All");
  const [actionType, setActionType] = useState("All");
  const [objectType, setObjectType] = useState("All");
  const [source, setSource] = useState("All");

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesText = JSON.stringify(event).toLowerCase().includes(filter.toLowerCase());
        const matchesActor = actor === "All" || event.actor === actor;
        const matchesAction = actionType === "All" || event.action_type === actionType;
        const matchesObject = objectType === "All" || event.object_type === objectType;
        const matchesSource = source === "All" || event.source === source;
        return matchesText && matchesActor && matchesAction && matchesObject && matchesSource;
      }),
    [actionType, actor, events, filter, objectType, source]
  );

  const options = useMemo(
    () => ({
      actors: [...new Set(events.map((event) => event.actor))],
      actionTypes: [...new Set(events.map((event) => event.action_type))],
      objectTypes: [...new Set(events.map((event) => event.object_type))],
      sources: [...new Set(events.map((event) => event.source))]
    }),
    [events]
  );

  const columns = useMemo<ColumnDef<AuditEvent>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => formatDateTime(row.original.timestamp)
      },
      {
        accessorKey: "actor",
        header: "Actor"
      },
      {
        accessorKey: "action_type",
        header: "Action",
        cell: ({ row }) => <Badge variant="ai">{row.original.action_type}</Badge>
      },
      {
        accessorKey: "object_type",
        header: "Object"
      },
      {
        accessorKey: "object_id",
        header: "Object ID"
      },
      {
        accessorKey: "source",
        header: "Source"
      },
      {
        accessorKey: "comment",
        header: "Comment"
      }
    ],
    []
  );

  const table = useReactTable({
    data: filteredEvents,
    columns: compact ? columns.slice(0, 5) : columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <Card className="overflow-hidden">
      {!compact ? (
        <div className="grid gap-3 border-b p-4 md:grid-cols-5">
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search date or keyword"
          />
          <select className="h-10 rounded-md border bg-white px-3 text-sm" value={actor} onChange={(event) => setActor(event.target.value)}>
            <option value="All">All actors</option>
            {options.actors.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-white px-3 text-sm" value={actionType} onChange={(event) => setActionType(event.target.value)}>
            <option value="All">All actions</option>
            {options.actionTypes.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-white px-3 text-sm" value={objectType} onChange={(event) => setObjectType(event.target.value)}>
            <option value="All">All objects</option>
            {options.objectTypes.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select className="h-10 rounded-md border bg-white px-3 text-sm" value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="All">All sources</option>
            {options.sources.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
      ) : null}
      <div className="thin-scrollbar overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  <TableCell key={cell.id} className="whitespace-nowrap">
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
