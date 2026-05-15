"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AiMatchCandidate } from "@/lib/types";

export function MatchExplanationPanel({
  candidate,
  onUpdateHarmonisedName
}: {
  candidate?: AiMatchCandidate;
  onUpdateHarmonisedName?: (harmonisedRowId: string, componentName: string) => void;
}) {
  const [draftName, setDraftName] = useState(candidate?.candidate_b.component_name ?? "");

  useEffect(() => {
    setDraftName(candidate?.candidate_b.component_name ?? "");
  }, [candidate?.id, candidate?.candidate_b.component_name]);

  if (!candidate) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">No candidate selected.</CardContent>
      </Card>
    );
  }

  const sourceIds = [
    candidate.candidate_b.ERP_record_id,
    candidate.candidate_b.PLM_record_id,
    candidate.candidate_b.SUP_REC_record_id
  ].filter(Boolean);
  const harmonisedRowId = candidate.candidate_b.harmonised_row_id;
  const canSave =
    Boolean(harmonisedRowId) &&
    draftName.trim().length > 0 &&
    draftName.trim() !== candidate.candidate_b.component_name;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>Match explanation</CardTitle>
          <Badge variant={candidate.confidence >= 90 ? "success" : "warning"}>{candidate.confidence}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Candidate A</p>
            <p className="mt-1 font-semibold">{candidate.candidate_a.component_name}</p>
            <p className="text-xs text-muted-foreground">
              {candidate.candidate_a.material} · {candidate.candidate_a.weight_g} g
            </p>
          </div>
          <div className="rounded-lg border bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Candidate B</p>
            <p className="mt-1 font-semibold">{candidate.candidate_b.component_name}</p>
            <p className="text-xs text-muted-foreground">
              {candidate.candidate_b.material} · {candidate.candidate_b.weight_g} g
            </p>
            {sourceIds.length ? (
              <p className="mt-2 text-xs text-muted-foreground">{sourceIds.join(" · ")}</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs text-muted-foreground">Reason</p>
          <p className="mt-1 text-sm font-medium">{candidate.reason}</p>
        </div>
        <div className="rounded-lg border bg-blue-50 p-3">
          <p className="text-xs text-blue-700">Suggested canonical name</p>
          <p className="mt-1 text-sm font-semibold text-blue-950">{candidate.suggested_canonical_name}</p>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs font-medium text-muted-foreground">Custom harmonised naming</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              aria-label="Custom harmonised component name"
            />
            <Button
              type="button"
              disabled={!canSave}
              onClick={() => {
                if (harmonisedRowId) onUpdateHarmonisedName?.(harmonisedRowId, draftName);
              }}
            >
              Sync to ETL
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Saves the name on the shared harmonised ETL row, so the ETL Pipeline table updates with the same value.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
