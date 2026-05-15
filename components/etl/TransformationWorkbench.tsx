"use client";

import { useMemo, useState } from "react";
import transformations from "@/data/transformations.json";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applyTransformation } from "@/lib/transformations";
import type { TransformationExample } from "@/lib/types";

export function TransformationWorkbench() {
  const [hasRun, setHasRun] = useState(false);
  const examples = transformations as unknown as TransformationExample[];
  const sampleRecord = {
    material_code: "PE-HD",
    country: "Deutschland",
    weight: "0.012 kg",
    supplier: "Acme GmbH",
    recycled_content: "30 percent"
  };
  const transformed = useMemo(() => applyTransformation(sampleRecord), []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Transformation workbench</CardTitle>
          <Button onClick={() => setHasRun(true)}>{hasRun ? "Simulation complete" : "Run simulation"}</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          {examples.map((example) => (
            <div key={example.id} className="rounded-lg border bg-slate-50 p-3">
              <Badge variant="outline">{example.field}</Badge>
              <p className="mt-3 text-sm font-semibold">{example.source_value}</p>
              <p className="text-xs text-muted-foreground">to</p>
              <p className="text-sm font-semibold text-emerald-700">{example.transformed_value}</p>
            </div>
          ))}
        </div>
        {hasRun ? (
          <pre className="thin-scrollbar overflow-x-auto rounded-lg border bg-slate-950 p-4 text-xs text-slate-50">
            {JSON.stringify(transformed, null, 2)}
          </pre>
        ) : (
          <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">
            Simulation has not run yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
