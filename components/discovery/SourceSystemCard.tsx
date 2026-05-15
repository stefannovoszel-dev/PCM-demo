import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SourceSystemCard({
  name,
  datapoints,
  owner
}: {
  name: string;
  datapoints: string[];
  owner: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{name}</CardTitle>
          <Database className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        <p className="text-xs text-muted-foreground">{owner}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {datapoints.map((datapoint) => (
            <Badge key={datapoint} variant="outline">
              {datapoint}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
