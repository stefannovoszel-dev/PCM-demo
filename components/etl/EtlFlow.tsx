"use client";

import { Background, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";

export function EtlFlow({ running = false }: { running?: boolean }) {
  const steps = ["Extract", "Profile", "Cleanse", "Harmonise", "Match", "Validate", "Publish"];
  const nodes: Node[] = steps.map((step, index) => ({
    id: step,
    position: { x: index * 180, y: index % 2 === 0 ? 60 : 160 },
    data: {
      label: (
        <div className="w-36 rounded-lg border bg-white p-3 text-center">
          <p className="text-sm font-semibold">{step}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {step === "Publish" ? "Simulated target" : "PPWR data"}
          </p>
        </div>
      )
    }
  }));

  const edges: Edge[] = steps.slice(0, -1).map((step, index) => ({
    id: `${step}-${steps[index + 1]}`,
    source: step,
    target: steps[index + 1],
    animated: running
  }));

  return (
    <div className="h-80 overflow-hidden rounded-lg border bg-white">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#cbd5e1" gap={18} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
