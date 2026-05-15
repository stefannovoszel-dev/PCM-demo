import { PPWR_ROLE_RESPONSIBILITIES } from "@/lib/ppwr-role-responsibilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleBadge } from "./RoleBadge";

export function RoleResponsibilityMatrix({ mode = "responsibilities" }: { mode?: "responsibilities" | "data" }) {
  const isDataMode = mode === "data";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isDataMode ? "Data requirements by role" : "Responsibility matrix"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-56">Role</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>{isDataMode ? "Required data" : "Responsibilities"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PPWR_ROLE_RESPONSIBILITIES.map((item) => (
                <TableRow key={item.role}>
                  <TableCell>
                    <RoleBadge role={item.role} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.responsibilityGroup}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {(isDataMode ? item.dataRequirements : item.responsibilities).map((entry) => (
                        <span
                          key={entry}
                          className="rounded-full border bg-white px-2 py-1 text-xs text-slate-700"
                        >
                          {entry}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
