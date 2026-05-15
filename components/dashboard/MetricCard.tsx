import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "default"
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "ai";
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm text-slate-600">{label}</CardTitle>
          {icon ? <div className="text-slate-400">{icon}</div> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tracking-normal text-slate-950">{value}</p>
          {detail ? <Badge variant={tone === "default" ? "secondary" : tone}>{detail}</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}
