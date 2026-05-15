"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CompletenessChart() {
  const data = [
    { domain: "Structure", complete: 96 },
    { domain: "Material", complete: 82 },
    { domain: "Mass", complete: 94 },
    { domain: "Evidence", complete: 58 },
    { domain: "Supplier", complete: 48 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completeness by Data Domain</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="domain" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="complete" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
