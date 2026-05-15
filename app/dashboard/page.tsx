"use client";

import { Boxes, CheckCircle2, Database, FileWarning, PackageCheck, Sparkles } from "lucide-react";
import datapoints from "@/data/ppwr-datapoints.json";
import { AuditTrailTable } from "@/components/audit/AuditTrailTable";
import { CompletenessChart } from "@/components/dashboard/CompletenessChart";
import { DataQualitySourceChart } from "@/components/dashboard/DataQualitySourceChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ReadinessGauge } from "@/components/dashboard/ReadinessGauge";
import { SupplierEvidenceChart } from "@/components/dashboard/SupplierEvidenceChart";
import { Badge } from "@/components/ui/badge";
import { useDemoState } from "@/lib/demo-state";

export default function DashboardPage() {
  const { components, matchCandidates, auditEvents, readiness, initialReadiness } = useDemoState();
  const requiredDatapoints = datapoints.filter((datapoint) => datapoint.required).length;
  const missingEvidence = components.filter((component) => !component.evidence_url || component.certificate_status === "Expired").length;
  const completeDatapoints = components.length * requiredDatapoints - components.reduce((sum, component) => sum + component.missing_fields.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="ai">Compliance readiness dashboard</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">PPWR readiness for Sparkling Water 1L</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Packaging ID PKG-7781 · Germany / DE · simulated osapiens-ready payload target
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Products assessed" value={1} detail="PPWR" icon={<PackageCheck className="h-5 w-5" />} />
        <MetricCard label="Packaging components" value={components.length} detail="5 nodes" icon={<Boxes className="h-5 w-5" />} />
        <MetricCard label="Required datapoints" value={requiredDatapoints} detail="per component" icon={<Database className="h-5 w-5" />} />
        <MetricCard label="Complete datapoints" value={completeDatapoints} detail={`${readiness.datapointCompleteness}%`} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard label="Missing supplier evidence" value={missingEvidence} detail="open" tone="warning" icon={<FileWarning className="h-5 w-5" />} />
        <MetricCard label="AI duplicate candidates" value={matchCandidates.length} detail="deterministic" tone="ai" icon={<Sparkles className="h-5 w-5" />} />
        <MetricCard label="Ready for osapiens hub" value={`${readiness.score}%`} detail="simulated" tone={readiness.score >= 90 ? "success" : "warning"} />
        <MetricCard label="After playback target" value="~91%" detail="expected" tone="success" />
      </div>

      <ReadinessGauge readiness={readiness} initialScore={initialReadiness.score} />

      <div className="grid gap-4 xl:grid-cols-3">
        <CompletenessChart />
        <SupplierEvidenceChart components={components} />
        <DataQualitySourceChart />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent audit events</h2>
        <AuditTrailTable events={auditEvents.slice(0, 5)} compact />
      </div>
    </div>
  );
}
