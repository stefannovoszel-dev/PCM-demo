"use client";

import { useMemo, useState } from "react";
import { FileJson, ShieldCheck } from "lucide-react";
import { PayloadPreview } from "@/components/osapiens/PayloadPreview";
import { PublishSimulation } from "@/components/osapiens/PublishSimulation";
import { SchemaValidationPanel } from "@/components/osapiens/SchemaValidationPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDemoState } from "@/lib/demo-state";
import {
  createOsapiensPayload,
  validateOsapiensPayload,
  type SimulatedOsapiensPayload
} from "@/lib/osapiens-payload";
import type { ValidationResult } from "@/lib/types";

export default function OsapiensPayloadPage() {
  const { product, components, recordAuditEvent } = useDemoState();
  const [payload, setPayload] = useState<SimulatedOsapiensPayload | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [published, setPublished] = useState(false);
  const harmonisedRows = useMemo(() => components.slice(0, 5), [components]);

  const generate = () => {
    const nextPayload = createOsapiensPayload(product, components);
    setPayload(nextPayload);
    setPublished(false);
    recordAuditEvent({
      actor: "System",
      action_type: "Payload regenerated",
      object_type: "Simulated osapiens-ready payload",
      object_id: product.packaging_id,
      before_value: null,
      after_value: { components: components.length },
      source: "Payload generator",
      comment: "Generated local simulated payload preview."
    });
  };

  const validate = () => {
    const result = validateOsapiensPayload(payload);
    setValidation(result);
    recordAuditEvent({
      actor: "System",
      action_type: "Validation completed",
      object_type: "Simulated osapiens-ready payload",
      object_id: product.packaging_id,
      before_value: null,
      after_value: { valid: result.valid },
      source: "Payload generator",
      comment: "Simulated payload validation completed."
    });
  };

  const publish = () => {
    setPublished(true);
    recordAuditEvent({
      actor: "System",
      action_type: "Simulated publish completed",
      object_type: "Simulated osapiens-ready payload",
      object_id: product.packaging_id,
      before_value: { status: "Validated" },
      after_value: { status: "Simulated published" },
      source: "Publish simulation",
      comment: "No real external API was called."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge variant="ai">Simulated osapiens payload page</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Simulated osapiens-ready payload</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Local JSON preview for PPWR-ready packaging data. This is not an official osapiens schema.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={generate}>
            <FileJson className="h-4 w-4" aria-hidden="true" />
            Generate payload
          </Button>
          <Button variant="outline" disabled={!payload} onClick={validate}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Validate payload
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Harmonised data</CardTitle>
          </CardHeader>
          <CardContent className="thin-scrollbar overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {harmonisedRows.map((component) => (
                  <TableRow key={component.component_id}>
                    <TableCell>{component.component_name}</TableCell>
                    <TableCell>{component.material}</TableCell>
                    <TableCell>{component.weight_g} g</TableCell>
                    <TableCell>{component.supplier_id}</TableCell>
                    <TableCell>
                      <Badge variant={component.evidence_url ? "success" : "warning"}>
                        {component.evidence_url ? "Linked" : "Missing"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <SchemaValidationPanel result={validation} />
          <PublishSimulation canPublish={Boolean(payload && validation?.valid)} published={published} onPublish={publish} />
        </div>
        <PayloadPreview payload={payload} />
      </div>
    </div>
  );
}
