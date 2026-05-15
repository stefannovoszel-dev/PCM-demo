"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { REGULATIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export default function ScenarioPage() {
  const [family, setFamily] = useState("Beverages");
  const [country, setCountry] = useState("DE");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge variant="ai">Scenario selector</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Choose compliance scenario</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            PPWR is fully implemented for the Sparkling Water 1L packaging system.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-blue-700"
        >
          Continue to readiness
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REGULATIONS.map((regulation) => (
          <Card
            key={regulation.id}
            className={regulation.status === "Active" ? "border-blue-300 bg-blue-50/50" : "bg-white"}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{regulation.id}</CardTitle>
                <Badge variant={regulation.status === "Active" ? "success" : "secondary"}>
                  {regulation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="min-h-12 text-sm text-muted-foreground">{regulation.name}</p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {regulation.status === "Active" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Clock3 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                )}
                <span>{regulation.status === "Active" ? "Configured" : "Visible roadmap item"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PPWR configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium">Product family</span>
            <Select value={family} onChange={(event) => setFamily(event.target.value)}>
              <option>Beverages</option>
              <option>Personal Care</option>
              <option>Household</option>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Market country</span>
            <Select value={country} onChange={(event) => setCountry(event.target.value)}>
              <option value="DE">Germany / DE</option>
              <option value="AT">Austria / AT</option>
              <option value="FR">France / FR</option>
              <option value="NL">Netherlands / NL</option>
            </Select>
          </label>
          <div className="rounded-md border bg-slate-50 p-4">
            <p className="text-xs text-muted-foreground">Selected product</p>
            <p className="mt-1 font-semibold">Sparkling Water 1L</p>
            <p className="text-sm text-muted-foreground">{family} · {country} · PKG-7781</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
