"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ComponentCard } from "@/components/product/ComponentCard";
import { ComponentDetailPanel } from "@/components/product/ComponentDetailPanel";
import { ProductTree } from "@/components/product/ProductTree";
import { useDemoState } from "@/lib/demo-state";

export default function ProductExplorerPage() {
  const { product, components, evidenceDocuments, evidenceEvents, scoreChanges } = useDemoState();
  const [selectedId, setSelectedId] = useState(components[0]?.component_id);
  const selected = components.find((component) => component.component_id === selectedId) ?? components[0];

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="ai">Product and packaging explorer</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Packaging structure and evidence gaps</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sparkling Water 1L packaging system with supplier, material, recycled-content, and certificate records.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <ProductTree product={product} components={components} selectedId={selected?.component_id} onSelect={setSelectedId} />
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {components.map((component) => (
              <ComponentCard key={component.component_id} component={component} onSelect={setSelectedId} />
            ))}
          </div>
          {selected ? (
            <ComponentDetailPanel
              component={selected}
              evidenceDocuments={evidenceDocuments}
              evidenceEvents={evidenceEvents}
              scoreChanges={scoreChanges}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
