"use client";

import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ReadinessBreakdown } from "@/lib/scoring";

export function ReadinessGauge({
  readiness,
  initialScore
}: {
  readiness: ReadinessBreakdown;
  initialScore: number;
}) {
  const data = [{ name: "readiness", value: readiness.score, fill: "#2563eb" }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Readiness</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="72%"
                outerRadius="100%"
                data={data}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar background dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold text-slate-950">{readiness.score}%</span>
              <span className="text-xs text-muted-foreground">Current</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Initial readiness</span>
                <span className="font-semibold text-slate-950">{initialScore}%</span>
              </div>
              <Progress value={initialScore} className="mt-2" />
            </div>
            {[
              ["Datapoint completeness", readiness.datapointCompleteness],
              ["Evidence availability", readiness.evidenceAvailability],
              ["Data quality score", readiness.dataQualityScore],
              ["Validation pass rate", readiness.validationPassRate],
              ["Supplier confirmation", readiness.supplierConfirmationRate]
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">{value}%</span>
                </div>
                <Progress value={value as number} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
