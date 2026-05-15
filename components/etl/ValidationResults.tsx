"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoState } from "@/lib/demo-state";
import { validateComponent } from "@/lib/validation";

export function ValidationResults() {
  const { components } = useDemoState();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {components.map((component) => {
          const result = validateComponent(component);
          return (
            <div key={component.component_id} className="rounded-lg border bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {result.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
                  )}
                  <p className="text-sm font-semibold">{component.component_name}</p>
                </div>
                <Badge variant={result.valid ? "success" : "destructive"}>
                  {result.valid ? "Valid" : "Invalid"}
                </Badge>
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-600">
                {[...result.errors, ...result.warnings].slice(0, 3).map((message) => (
                  <p key={message}>{message}</p>
                ))}
                {!result.errors.length && !result.warnings.length ? <p>No findings</p> : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
