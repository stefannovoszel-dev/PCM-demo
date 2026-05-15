import { DataDiscoveryGraph } from "@/components/discovery/DataDiscoveryGraph";
import { SourceSystemCard } from "@/components/discovery/SourceSystemCard";
import { Badge } from "@/components/ui/badge";

const sources = [
  { name: "ERP", owner: "ERP Operations", datapoints: ["weight", "market country", "supplier"] },
  { name: "PLM", owner: "Packaging Engineering", datapoints: ["BOM", "material", "dimensions"] },
  { name: "Supplier Portal", owner: "Supplier Collaboration", datapoints: ["recycled %", "certificates"] },
  { name: "Excel / Legacy Files", owner: "Data Office", datapoints: ["aliases", "legacy IDs"] },
  { name: "Document Management", owner: "Compliance IT", datapoints: ["evidence URL", "expiry"] },
  { name: "Quality Management System", owner: "Quality Assurance", datapoints: ["recyclability grade"] },
  { name: "Procurement", owner: "Strategic Procurement", datapoints: ["supplier ID", "supplier status"] }
];

export default function DataDiscoveryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="ai">Data discovery map</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Fragmented source systems to compliance dataset</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Source data flows into the Compliance Data Platform before producing audit output and a simulated osapiens-ready payload.
        </p>
      </div>
      <DataDiscoveryGraph />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sources.map((source) => (
          <SourceSystemCard key={source.name} {...source} />
        ))}
      </div>
    </div>
  );
}
