"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimulatedOsapiensPayload } from "@/lib/osapiens-payload";

export function PayloadPreview({ payload }: { payload: SimulatedOsapiensPayload | null }) {
  const text = payload ? JSON.stringify(payload, null, 2) : "";

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Simulated osapiens-ready payload</CardTitle>
          <Button
            size="sm"
            variant="outline"
            disabled={!payload}
            onClick={() => payload && navigator.clipboard?.writeText(text)}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {payload ? (
          <pre className="thin-scrollbar max-h-[640px] overflow-auto rounded-lg border bg-slate-950 p-4 text-xs text-slate-50">
            {text}
          </pre>
        ) : (
          <div className="rounded-lg border bg-slate-50 p-5 text-sm text-muted-foreground">
            No simulated payload generated yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
