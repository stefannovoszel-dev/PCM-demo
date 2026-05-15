"use client";

import { RotateCcw, StepForward, Wand2 } from "lucide-react";
import { SupplierPlaybackTimeline } from "@/components/suppliers/SupplierPlaybackTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDemoState } from "@/lib/demo-state";

export default function SupplierPlaybackPage() {
  const {
    supplierEvents,
    readiness,
    initialReadiness,
    appliedSupplierEventCount,
    playSupplierEvents,
    applyNextSupplierEvent,
    resetSimulation
  } = useDemoState();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge variant="ai">Supplier playback simulator</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Supplier events update component readiness</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Playback events update component records, evidence status, readiness score, and audit trail entries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={playSupplierEvents}>
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            Play supplier events
          </Button>
          <Button variant="outline" onClick={applyNextSupplierEvent}>
            <StepForward className="h-4 w-4" aria-hidden="true" />
            Apply next event
          </Button>
          <Button variant="secondary" onClick={resetSimulation}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset simulation
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Initial readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{initialReadiness.score}%</p>
            <Progress value={initialReadiness.score} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{readiness.score}%</p>
            <Progress value={readiness.score} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Applied events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{appliedSupplierEventCount}/{supplierEvents.length}</p>
            <Progress value={(appliedSupplierEventCount / supplierEvents.length) * 100} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <SupplierPlaybackTimeline events={supplierEvents} />
    </div>
  );
}
