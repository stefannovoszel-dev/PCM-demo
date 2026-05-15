import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiMatchCandidate } from "@/lib/types";

export function MatchExplanationPanel({ candidate }: { candidate?: AiMatchCandidate }) {
  if (!candidate) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">No candidate selected.</CardContent>
      </Card>
    );
  }

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
      </CardContent>
    </Card>
  );
}
