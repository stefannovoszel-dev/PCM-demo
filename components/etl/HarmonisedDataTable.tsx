import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { applyTransformation } from "@/lib/transformations";

export function HarmonisedDataTable({ records }: { records: Record<string, unknown>[] }) {
  const transformed = records.map((record) => applyTransformation(record));
  const columns = ["record_id", "material", "weight_g", "supplier_id", "market_country"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Harmonised data</CardTitle>
      </CardHeader>
      <CardContent className="thin-scrollbar overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transformed.map((record, index) => (
              <TableRow key={String(record.record_id ?? index)}>
                {columns.map((column) => (
                  <TableCell key={column}>{String(record[column] ?? "")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
