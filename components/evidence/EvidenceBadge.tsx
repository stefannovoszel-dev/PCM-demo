import { Badge } from "@/components/ui/badge";
import { EVIDENCE_STATUS_LABELS, EVIDENCE_TYPE_LABELS } from "@/lib/evidence-events";
import type { EvidenceStatus, EvidenceType } from "@/lib/evidence-types";

export function EvidenceStatusBadge({ status }: { status: EvidenceStatus }) {
  const variant =
    status === "applied" || status === "validated"
      ? "success"
      : status === "rejected" || status === "expired"
        ? "destructive"
        : status === "needs_review"
          ? "warning"
          : "secondary";

  return <Badge variant={variant}>{EVIDENCE_STATUS_LABELS[status]}</Badge>;
}

export function EvidenceTypeBadge({ type }: { type: EvidenceType }) {
  return <Badge variant="outline">{EVIDENCE_TYPE_LABELS[type]}</Badge>;
}
