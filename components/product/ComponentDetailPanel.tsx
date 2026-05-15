"use client";

import { AlertTriangle, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceStatusBadge, EvidenceTypeBadge } from "@/components/evidence/EvidenceBadge";
import { getComponentWarningContexts } from "@/lib/component-warning-context";
import { getComponentEvidenceScore } from "@/lib/evidence-engine";
import { getMissingEvidenceLabels } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { EvidenceDocument, EvidenceEvent, ScoreChange } from "@/lib/evidence-types";
import type { PackagingComponent } from "@/lib/types";

export function ComponentDetailPanel({
  component,
  evidenceDocuments = [],
  evidenceEvents = [],
  scoreChanges = []
}: {
  component: PackagingComponent;
  evidenceDocuments?: EvidenceDocument[];
  evidenceEvents?: EvidenceEvent[];
  scoreChanges?: ScoreChange[];
}) {
  const linkedDocuments = evidenceDocuments.filter((document) => document.linked_component_id === component.component_id);
  const latestEvidenceEvent = evidenceEvents.find((event) => event.component_id === component.component_id);
  const latestScoreChange = scoreChanges.find((change) => change.component_id === component.component_id);
  const missingEvidence = getMissingEvidenceLabels(component, evidenceDocuments);
  const currentComponentScore = getComponentEvidenceScore(component, evidenceDocuments);
  const warningContexts = useMemo(
    () => getComponentWarningContexts(component, evidenceDocuments),
    [component, evidenceDocuments]
  );
  const [activeWarningKey, setActiveWarningKey] = useState<string | undefined>(warningContexts[0]?.fieldKey);
  const activeWarning =
    warningContexts.find((context) => context.fieldKey === activeWarningKey) ?? warningContexts[0];

  const detailRows: Array<{ label: string; value: string; warningKey?: string }> = [
    { label: "Packaging ID", value: component.packaging_id },
    { label: "Canonical name", value: component.canonical_component_name ?? component.component_name },
    {
      label: "Material",
      value: component.material,
      warningKey: component.missing_fields.includes("canonical_material") ? "canonical_material" : undefined
    },
    { label: "Weight", value: `${component.weight_g} g` },
    {
      label: "Supplier",
      value: `${component.supplier_name} (${component.supplier_id})`,
      warningKey: component.supplier_confirmed ? undefined : "supplier_confirmation"
    },
    {
      label: "Recycled content",
      value: component.recycled_content_percent === null ? "Missing" : `${component.recycled_content_percent}%`,
      warningKey: component.recycled_content_percent === null ? "recycled_content_percent" : undefined
    },
    {
      label: "Recyclability grade",
      value: component.recyclability_grade ?? "Missing",
      warningKey: component.recyclability_grade ? undefined : "recyclability_grade"
    },
    {
      label: "Certificate",
      value: component.certificate_id ?? "Missing",
      warningKey: !component.certificate_id && component.certificate_status !== "Not Required" ? "certificate_id" : undefined
    },
    {
      label: "Evidence status",
      value: linkedDocuments[0]?.validation_status ?? component.certificate_status,
      warningKey:
        component.certificate_status === "Expired"
          ? "valid_certificate"
          : component.certificate_status === "Missing"
            ? "certificate_status"
            : undefined
    },
    { label: "Current component score", value: `${currentComponentScore}%` },
    {
      label: "Previous component score",
      value: latestScoreChange?.previous_component_score === undefined ? "No score change yet" : `${latestScoreChange.previous_component_score}%`
    },
    {
      label: "New component score",
      value: latestScoreChange?.new_component_score === undefined ? "No score change yet" : `${latestScoreChange.new_component_score}%`
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{component.component_name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{component.component_id}</p>
          </div>
          <Badge variant={component.missing_fields.length ? "warning" : "success"}>
            {component.missing_fields.length ? "Review" : "Ready"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {detailRows.map((row) =>
            row.warningKey ? (
              <button
                key={row.label}
                type="button"
                onClick={() => setActiveWarningKey(row.warningKey)}
                className={cn(
                  "rounded-md border bg-amber-50 p-3 text-left ring-1 ring-amber-100 transition-colors hover:border-amber-300 hover:bg-amber-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                  activeWarning?.fieldKey === row.warningKey && "border-amber-400 bg-amber-100"
                )}
                aria-pressed={activeWarning?.fieldKey === row.warningKey}
              >
                <span className="flex items-center justify-between gap-2 text-xs text-amber-800">
                  {row.label}
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                </span>
                <span className="mt-1 block text-sm font-semibold text-slate-900">{row.value}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-800">
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  View context
                </span>
              </button>
            ) : (
              <div key={row.label} className="rounded-md border bg-slate-50 p-3">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{row.value}</p>
              </div>
            )
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Aliases</p>
          <div className="flex flex-wrap gap-2">
            {component.aliases.map((alias) => (
              <Badge key={alias} variant="outline">
                {alias}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Linked evidence documents</p>
          <div className="grid gap-2">
            {linkedDocuments.length ? (
              linkedDocuments.map((document) => (
                <div key={document.document_id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-white p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{document.document_name}</p>
                    <p className="text-xs text-muted-foreground">{document.document_id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <EvidenceTypeBadge type={document.evidence_type} />
                    <EvidenceStatusBadge status={document.validation_status} />
                  </div>
                </div>
              ))
            ) : (
              <Badge variant="warning">No linked evidence documents</Badge>
            )}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Latest evidence event</p>
          {latestEvidenceEvent ? (
            <div className="rounded-md border bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{latestEvidenceEvent.event_id}</p>
                <EvidenceTypeBadge type={latestEvidenceEvent.evidence_type} />
                <EvidenceStatusBadge status={latestEvidenceEvent.evidence_status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{latestEvidenceEvent.impact_summary}</p>
            </div>
          ) : (
            <Badge variant="secondary">No evidence event yet</Badge>
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Missing fields and evidence gaps</p>
          <div className="flex flex-wrap gap-2">
            {missingEvidence.length ? (
              missingEvidence.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => setActiveWarningKey(field)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                    activeWarning?.fieldKey === field && "bg-amber-100 ring-amber-400"
                  )}
                  aria-pressed={activeWarning?.fieldKey === field}
                >
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  {field}
                </button>
              ))
            ) : (
              <Badge variant="success">No open gaps</Badge>
            )}
          </div>
        </div>
        {activeWarning ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Warning context: {activeWarning.label}</p>
                <p className="mt-1 text-sm text-slate-700">{activeWarning.missing}</p>
              </div>
              <Badge variant="warning">{activeWarning.status}</Badge>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-md border border-amber-100 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legal context</p>
                <p className="mt-2 text-sm text-slate-700">{activeWarning.legalContext}</p>
              </div>
              <div className="rounded-md border border-amber-100 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required data/evidence</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {activeWarning.requiredEvidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-amber-100 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next action</p>
                <p className="mt-2 text-sm text-slate-700">{activeWarning.recommendedAction}</p>
                {activeWarning.dataOwner || activeWarning.sourceSystem ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Owner: {activeWarning.dataOwner ?? "Unassigned"} · Source: {activeWarning.sourceSystem ?? "Unknown"}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
