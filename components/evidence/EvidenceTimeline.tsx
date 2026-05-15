import { Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVIDENCE_TYPE_LABELS } from "@/lib/evidence-events";
import { formatDateTime } from "@/lib/utils";
import { EvidenceStatusBadge } from "./EvidenceBadge";
import type { EvidenceEvent } from "@/lib/evidence-types";

export function EvidenceTimeline({ events }: { events: EvidenceEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-blue-600" aria-hidden="true" />
          <CardTitle>Evidence timeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.slice(0, 8).map((event) => (
            <div key={event.event_id} className="grid gap-2 rounded-md border bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{event.event_id} · {EVIDENCE_TYPE_LABELS[event.evidence_type]}</p>
                <EvidenceStatusBadge status={event.evidence_status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(event.timestamp)} · {event.source} · {event.supplier_name ?? "Product-level event"}
              </p>
              <p className="text-sm text-slate-600">{event.impact_summary}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
