import Link from "next/link";
import { ArrowRight, Database, FileCheck2, GitMerge, Search, ShieldCheck, Sparkles } from "lucide-react";
import scenario from "@/data/scenario.json";
import { Stepper } from "@/components/layout/Stepper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="ai">PPWR scenario active</Badge>
              <Badge variant="outline">Local deterministic data</Badge>
              <Badge variant="outline">Simulated osapiens-ready payload</Badge>
            </div>
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 lg:text-5xl">
                Product Compliance Management Demo
              </h1>
              <p className="mt-4 max-w-3xl text-lg text-slate-600">
                From fragmented product and supplier data to osapiens-ready compliance datasets
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/scenario"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-blue-700"
              >
                Start PPWR Demo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-md border bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
              >
                View readiness
              </Link>
            </div>
          </div>
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle>Sparkling Water 1L · PKG-7781</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border bg-white p-3">
                  <p className="text-muted-foreground">Regulation</p>
                  <p className="font-semibold">{scenario.regulation}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-muted-foreground">Market</p>
                  <p className="font-semibold">{scenario.market_country_label}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-muted-foreground">Family</p>
                  <p className="font-semibold">{scenario.product_family}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-muted-foreground">Payload</p>
                  <p className="font-semibold">Simulated</p>
                </div>
              </div>
              <div className="rounded-md border bg-white p-4">
                <p className="text-sm font-semibold">Packaging System</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {["PET Bottle", "HDPE Cap Blue 28mm", "PET Label", "Shrink Film", "Transport Box"].map(
                    (component) => (
                      <div key={component} className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                        {component}
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Stepper steps={scenario.journey} activeIndex={4} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Discover", Search, "ERP, PLM, supplier portal, documents, and legacy files"],
          ["Harmonise", GitMerge, "Material, country, weight, and supplier normalization"],
          ["Match", Sparkles, "Deterministic AI-style duplicate part scoring"],
          ["Validate", FileCheck2, "PPWR checks and simulated payload readiness"]
        ].map(([title, Icon, text]) => {
          const IconComponent = Icon as typeof Database;
          return (
            <Card key={title as string}>
              <CardContent className="p-5">
                <IconComponent className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <p className="mt-3 font-semibold">{title as string}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text as string}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
