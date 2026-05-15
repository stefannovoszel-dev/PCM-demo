import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ValidationResult } from "@/lib/types";

export function SchemaValidationPanel({ result }: { result: ValidationResult | null }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Validation status</CardTitle>
          {result ? (
            <Badge variant={result.valid ? "success" : "destructive"}>
              {result.valid ? "Valid" : "Invalid"}
            </Badge>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {result ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              {result.valid ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
              )}
              <span>{result.valid ? "Payload passes simulated schema checks." : "Payload needs corrections."}</span>
            </div>
            {[...result.errors, ...result.warnings].map((message) => (
              <div key={message} className="rounded-md border bg-slate-50 p-3 text-sm">
                {message}
              </div>
            ))}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Validation has not run yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
