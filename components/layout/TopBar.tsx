"use client";

import { CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDemoState } from "@/lib/demo-state";

export function TopBar() {
  const { readiness, appliedSupplierEventCount } = useDemoState();

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div>
          <p className="text-sm font-semibold text-slate-900">PPWR packaging compliance workspace</p>
          <p className="text-xs text-muted-foreground">
            Deterministic local demo data · no real external API integrations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="ai">
            <Database className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Local seed data
          </Badge>
          <Badge variant={appliedSupplierEventCount > 0 ? "success" : "warning"}>
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {appliedSupplierEventCount}/5 supplier events
          </Badge>
          <div className="min-w-44">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Readiness</span>
              <span className="font-semibold text-slate-900">{readiness.score}%</span>
            </div>
            <Progress value={readiness.score} />
          </div>
          <Badge variant="outline">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Simulated payload only
          </Badge>
        </div>
      </div>
    </header>
  );
}
