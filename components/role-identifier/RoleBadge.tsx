import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PpwrRole } from "@/lib/ppwr-role-types";

const roleClasses: Record<PpwrRole, string> = {
  Manufacturer: "border-blue-200 bg-blue-50 text-blue-700",
  Importer: "border-indigo-200 bg-indigo-50 text-indigo-700",
  Distributor: "border-slate-200 bg-slate-100 text-slate-700",
  "Producer for EPR": "border-emerald-200 bg-emerald-50 text-emerald-700",
  Supplier: "border-amber-200 bg-amber-50 text-amber-800",
  "Authorised Representative for EPR": "border-violet-200 bg-violet-50 text-violet-700",
  "Final Distributor": "border-cyan-200 bg-cyan-50 text-cyan-800",
  "Fulfilment Service Provider": "border-orange-200 bg-orange-50 text-orange-800",
  "Online Marketplace": "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
  "No EU placing-on-market role": "border-slate-200 bg-white text-slate-700",
  "Review Required": "border-red-200 bg-red-50 text-red-700"
};

export function RoleBadge({ role, className }: { role: PpwrRole; className?: string }) {
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", roleClasses[role], className)}>
      {role}
    </Badge>
  );
}
