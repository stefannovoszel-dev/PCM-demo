"use client";

import { RotateCcw, StepForward, UserCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EvidenceEventSimulator({
  onNext,
  onAll,
  onReset,
  onReviewPending,
  pendingCount
}: {
  onNext: () => void;
  onAll: () => void;
  onReset: () => void;
  onReviewPending: () => void;
  pendingCount: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onNext}>
        <StepForward className="h-4 w-4" aria-hidden="true" />
        Simulate next evidence event
      </Button>
      <Button variant="outline" onClick={onAll}>
        <Wand2 className="h-4 w-4" aria-hidden="true" />
        Simulate all evidence events
      </Button>
      <Button variant="outline" onClick={onReviewPending}>
        <UserCheck className="h-4 w-4" aria-hidden="true" />
        Review pending evidence ({pendingCount})
      </Button>
      <Button variant="secondary" onClick={onReset}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset evidence simulation
      </Button>
    </div>
  );
}
