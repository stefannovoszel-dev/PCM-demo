import { CheckCircle2, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SupplierEvent } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function SupplierEventCard({ event }: { event: SupplierEvent }) {
  return (
    <Card className={event.status === "Applied" ? "border-emerald-200 bg-emerald-50/40" : "bg-white"}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {event.status === "Applied" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            ) : (
              <Clock3 className="h-5 w-5 text-slate-400" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-900">{event.title}</p>
              <Badge variant={event.status === "Applied" ? "success" : "secondary"}>{event.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{event.supplier_name}</span>
              <span>{event.component_id}</span>
              <span>{formatDateTime(event.timestamp)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
