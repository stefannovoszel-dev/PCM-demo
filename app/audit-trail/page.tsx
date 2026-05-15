"use client";

import { AuditTrailTable } from "@/components/audit/AuditTrailTable";
import { Badge } from "@/components/ui/badge";
import { useDemoState } from "@/lib/demo-state";

export default function AuditTrailPage() {
  const { auditEvents } = useDemoState();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="ai">Audit trail</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Traceable compliance actions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search actor, action type, object type, source, date, and payload simulation events.
        </p>
      </div>
      <AuditTrailTable events={auditEvents} />
    </div>
  );
}
