"use client";

import { useState } from "react";
import rawErp from "@/data/raw-erp-records.json";
import rawPlm from "@/data/raw-plm-records.json";
import rawSupplier from "@/data/raw-supplier-records.json";
import { EtlFlow } from "@/components/etl/EtlFlow";
import { HarmonisedDataTable } from "@/components/etl/HarmonisedDataTable";
import { RawDataTable } from "@/components/etl/RawDataTable";
import { TransformationWorkbench } from "@/components/etl/TransformationWorkbench";
import { ValidationResults } from "@/components/etl/ValidationResults";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EtlPipelinePage() {
  const [running, setRunning] = useState(false);
  const start = () => {
    setRunning(true);
    window.setTimeout(() => setRunning(false), 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge variant="ai">ETL pipeline simulation</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Extract, harmonise, match, validate, publish</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pipeline simulation from mixed ERP, PLM, and supplier records to harmonised PPWR component data.
          </p>
        </div>
        <Button onClick={start}>{running ? "Running..." : "Run simulation"}</Button>
      </div>
      <EtlFlow running={running} />
      <TransformationWorkbench />
      <div className="grid gap-4 xl:grid-cols-3">
        <RawDataTable title="Raw ERP records" records={rawErp as unknown as Record<string, unknown>[]} />
        <RawDataTable title="Raw PLM records" records={rawPlm as unknown as Record<string, unknown>[]} />
        <RawDataTable title="Raw supplier records" records={rawSupplier as unknown as Record<string, unknown>[]} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <HarmonisedDataTable records={rawErp as unknown as Record<string, unknown>[]} />
        <ValidationResults />
      </div>
    </div>
  );
}
