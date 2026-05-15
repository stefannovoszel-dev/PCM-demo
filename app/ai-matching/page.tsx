"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { AiMatchTable } from "@/components/matching/AiMatchTable";
import { MatchExplanationPanel } from "@/components/matching/MatchExplanationPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDemoState } from "@/lib/demo-state";
import { calculateMatchConfidence } from "@/lib/matching";
import type { AiMatchCandidate } from "@/lib/types";

export default function AiMatchingPage() {
  const { matchCandidates, updateHarmonisedRowName } = useDemoState();
  const enriched = useMemo(
    () =>
      matchCandidates.map((candidate) => ({
        ...candidate,
        ...calculateMatchConfidence(candidate.candidate_a, candidate.candidate_b)
      })),
    [matchCandidates]
  );
  const [selected, setSelected] = useState<AiMatchCandidate | undefined>(enriched[0]);
  const currentSelected = enriched.find((candidate) => candidate.id === selected?.id) ?? enriched[0];

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="ai">AI part matching console</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Duplicate packaging part matching</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Deterministic scoring combines material, name tokens, supplier, dimensions, and weight tolerance from the shared harmonised ETL rows.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Sparkles className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold">{enriched.filter((candidate) => candidate.confidence >= 90).length}</p>
              <p className="text-sm text-muted-foreground">Auto-accept candidates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-semibold">{enriched.filter((candidate) => candidate.confidence >= 70 && candidate.confidence < 90).length}</p>
            <p className="text-sm text-muted-foreground">Review candidates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-semibold">{enriched.filter((candidate) => candidate.status !== "Suggested").length}</p>
            <p className="text-sm text-muted-foreground">Steward actions applied</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <AiMatchTable candidates={enriched} onSelect={setSelected} />
        <MatchExplanationPanel candidate={currentSelected} onUpdateHarmonisedName={updateHarmonisedRowName} />
      </div>
    </div>
  );
}
