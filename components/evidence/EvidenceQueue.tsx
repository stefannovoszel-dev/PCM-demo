"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EVIDENCE_TYPE_LABELS } from "@/lib/evidence-events";
import { cn, formatDateTime } from "@/lib/utils";
import { EvidenceStatusBadge } from "./EvidenceBadge";
import type { EvidenceEvent } from "@/lib/evidence-types";

type SortKey =
  | "event_id"
  | "timestamp"
  | "source"
  | "evidence_type"
  | "supplier_name"
  | "component_id"
  | "evidence_status"
  | "confidence"
  | "requires_human_review";

type SortDirection = "asc" | "desc";
type SortState = { key: SortKey; direction: SortDirection } | null;

const confidenceRank: Record<EvidenceEvent["confidence"], number> = {
  low: 1,
  medium: 2,
  high: 3
};

const sortableColumns: Array<{ key: SortKey; label: string; className?: string }> = [
  { key: "event_id", label: "Event ID" },
  { key: "timestamp", label: "Time" },
  { key: "source", label: "Source" },
  { key: "evidence_type", label: "Evidence Type", className: "min-w-56" },
  { key: "supplier_name", label: "Supplier" },
  { key: "component_id", label: "Component" },
  { key: "evidence_status", label: "Status" },
  { key: "confidence", label: "Confidence" },
  { key: "requires_human_review", label: "Human Review Required" }
];

function getSortValue(event: EvidenceEvent, key: SortKey) {
  if (key === "timestamp") return new Date(event.timestamp).getTime();
  if (key === "evidence_type") return EVIDENCE_TYPE_LABELS[event.evidence_type];
  if (key === "supplier_name") return event.supplier_name ?? "Product-level";
  if (key === "component_id") return event.component_id ?? "Packaging";
  if (key === "confidence") return confidenceRank[event.confidence];
  if (key === "requires_human_review") return event.requires_human_review ? 1 : 0;
  return event[key];
}

function compareSortValues(a: string | number | boolean, b: string | number | boolean) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

export function EvidenceQueue({
  events,
  selectedEventId,
  onApprove,
  onReject
}: {
  events: EvidenceEvent[];
  selectedEventId?: string;
  onApprove: (eventId: string) => void;
  onReject: (eventId: string) => void;
}) {
  const [sort, setSort] = useState<SortState>(null);
  const sortedEvents = useMemo(() => {
    if (!sort) return events;

    return events
      .map((event, index) => ({ event, index }))
      .sort((a, b) => {
        const result = compareSortValues(getSortValue(a.event, sort.key), getSortValue(b.event, sort.key));
        if (result === 0) return a.index - b.index;
        return sort.direction === "asc" ? result : -result;
      })
      .map(({ event }) => event);
  }, [events, sort]);

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }

  function getAriaSort(key: SortKey) {
    if (sort?.key !== key) return "none";
    return sort.direction === "asc" ? "ascending" : "descending";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence queue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="thin-scrollbar overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {sortableColumns.map((column) => {
                  const active = sort?.key === column.key;
                  const SortIcon = active ? (sort.direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

                  return (
                    <TableHead key={column.key} className={column.className} aria-sort={getAriaSort(column.key)}>
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-sm text-left transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active && "text-slate-900"
                        )}
                      >
                        {column.label}
                        <SortIcon className={cn("h-3.5 w-3.5", active ? "text-slate-700" : "text-slate-400")} aria-hidden="true" />
                      </button>
                    </TableHead>
                  );
                })}
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEvents.map((event) => {
                const approveLocked =
                  event.evidence_status === "applied" ||
                  event.evidence_status === "rejected" ||
                  event.evidence_status === "expired";

                return (
                  <TableRow key={event.event_id} className={selectedEventId === event.event_id ? "bg-blue-50" : undefined}>
                    <TableCell className="font-medium">{event.event_id}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(event.timestamp)}</TableCell>
                    <TableCell>{event.source}</TableCell>
                    <TableCell className="min-w-56">{EVIDENCE_TYPE_LABELS[event.evidence_type]}</TableCell>
                    <TableCell>{event.supplier_name ?? "Product-level"}</TableCell>
                    <TableCell>{event.component_id ?? "Packaging"}</TableCell>
                    <TableCell><EvidenceStatusBadge status={event.evidence_status} /></TableCell>
                    <TableCell className="capitalize">{event.confidence}</TableCell>
                    <TableCell>{event.requires_human_review ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!approveLocked) onApprove(event.event_id);
                          }}
                          aria-disabled={approveLocked}
                          className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onReject(event.event_id)} disabled={event.evidence_status === "applied" || event.evidence_status === "rejected"}>
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
