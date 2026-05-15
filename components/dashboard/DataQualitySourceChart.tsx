"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import inventory from "@/data/data-inventory.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DataInventoryRecord } from "@/lib/types";

export function DataQualitySourceChart() {
  const records = inventory as unknown as DataInventoryRecord[];
  const bySource = Object.values(
    records.reduce<Record<string, { source: string; total: number; count: number }>>((acc, record) => {
      const source = record.primary_source_system;
      acc[source] = acc[source] ?? { source, total: 0, count: 0 };
      acc[source].total += record.dq_score;
      acc[source].count += 1;
      return acc;
    }, {})
  ).map((item) => ({
    source: item.source.replace("Quality Management System", "QMS").replace("Document Management", "Docs"),
    dq: Math.round(item.total / item.count)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Quality by Source System</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bySource}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="source" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="dq" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
