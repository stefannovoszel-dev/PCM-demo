"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PackagingComponent } from "@/lib/types";

export function SupplierEvidenceChart({ components }: { components: PackagingComponent[] }) {
  const data = components.map((component) => ({
    supplier: component.supplier_name.replace(" GmbH", "").replace(" AG", ""),
    missing: component.missing_fields.filter((field) => field.includes("evidence") || field.includes("certificate")).length
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Missing Evidence by Supplier</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="supplier" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="missing" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
