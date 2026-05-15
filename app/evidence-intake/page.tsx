import { EvidenceIntakePanel } from "@/components/evidence/EvidenceIntakePanel";
import { Badge } from "@/components/ui/badge";

export default function EvidenceIntakePage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="ai">Evidence Intake & Auto-Recalculation</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Evidence intake and readiness recalculation</h1>
        <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
          Simulate supplier, document-management, internal-system and mock osapiens evidence arrivals. The demo validates evidence locally,
          applies compatible updates, recalculates readiness and writes audit events without calling an external API.
        </p>
      </div>
      <EvidenceIntakePanel />
    </div>
  );
}
