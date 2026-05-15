import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { HarmonisedDataRow } from "@/lib/transformations";

export function HarmonisedDataTable({
  rows
}: {
  rows: HarmonisedDataRow[];
}) {
  const columns = [
    "ERP_record_id",
    "PLM_record_id",
    "SUP_REC_record_id",
    "component_name",
    "material",
    "weight_g",
    "supplier_id",
    "market_country"
  ];

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
            {rows.map((record, index) => (
              <TableRow key={`${record.ERP_record_id ?? "no-erp"}-${record.PLM_record_id ?? "no-plm"}-${record.SUP_REC_record_id ?? "no-supplier"}-${index}`}>
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
