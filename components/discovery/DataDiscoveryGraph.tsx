"use client";

import { Background, Controls, Handle, Position, ReactFlow, type Edge, type Node, type NodeTypes } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";

function SystemNode({
  data
}: {
  data: any;
}) {
  const toneClass =
    data.tone === "platform"
      ? "border-blue-300 bg-blue-50"
      : data.tone === "output"
        ? "border-emerald-300 bg-emerald-50"
        : "bg-white";
  return (
    <div className={`w-56 rounded-lg border p-3 ${toneClass}`}>
      <Handle type="target" position={Position.Left} />
      <p className="text-sm font-semibold text-slate-900">{data.title}</p>
      {data.subtitle ? <p className="mt-1 text-xs text-slate-500">{data.subtitle}</p> : null}
      <div className="mt-2 flex flex-wrap gap-1">
        {data.datapoints?.map((datapoint: string) => (
          <Badge key={datapoint} variant="outline" className="bg-white text-[10px]">
            {datapoint}
          </Badge>
        ))}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes: NodeTypes = { system: SystemNode };

export function DataDiscoveryGraph() {
  const nodes: Node[] = [
    { id: "erp", type: "system", position: { x: 0, y: 0 }, data: { title: "ERP", subtitle: "SKU and market extensions", datapoints: ["weight", "market", "supplier"] } },
    { id: "plm", type: "system", position: { x: 0, y: 120 }, data: { title: "PLM", subtitle: "Packaging BOM", datapoints: ["structure", "material", "dimensions"] } },
    { id: "supplier", type: "system", position: { x: 0, y: 240 }, data: { title: "Supplier Portal", subtitle: "Declarations", datapoints: ["recycled %", "certificates"] } },
    { id: "excel", type: "system", position: { x: 0, y: 360 }, data: { title: "Excel / Legacy Files", subtitle: "Alias workbooks", datapoints: ["aliases", "legacy IDs"] } },
    { id: "docs", type: "system", position: { x: 300, y: 0 }, data: { title: "Document Management", subtitle: "Evidence documents", datapoints: ["PDFs", "expiry"] } },
    { id: "qms", type: "system", position: { x: 300, y: 120 }, data: { title: "Quality Management System", subtitle: "Recyclability tests", datapoints: ["grade", "test report"] } },
    { id: "proc", type: "system", position: { x: 300, y: 240 }, data: { title: "Procurement", subtitle: "Supplier master", datapoints: ["supplier ID", "status"] } },
    { id: "platform", type: "system", position: { x: 620, y: 170 }, data: { title: "Compliance Data Platform", subtitle: "Discover, harmonise, match, validate", datapoints: ["PPWR dataset"], tone: "platform" } },
    { id: "hub", type: "system", position: { x: 940, y: 90 }, data: { title: "osapiens Hub", subtitle: "Simulated target", datapoints: ["simulated payload"], tone: "output" } },
    { id: "audit", type: "system", position: { x: 940, y: 250 }, data: { title: "Reporting / Audit Output", subtitle: "Traceable evidence", datapoints: ["audit trail", "readiness"], tone: "output" } }
  ];

  const sourceIds = ["erp", "plm", "supplier", "excel", "docs", "qms", "proc"];
  const edges: Edge[] = [
    ...sourceIds.map((id) => ({ id: `${id}-platform`, source: id, target: "platform", animated: true })),
    { id: "platform-hub", source: "platform", target: "hub", animated: true },
    { id: "platform-audit", source: "platform", target: "audit", animated: true }
  ];

  return (
    <div className="h-[620px] overflow-hidden rounded-lg border bg-white">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background color="#cbd5e1" gap={18} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
