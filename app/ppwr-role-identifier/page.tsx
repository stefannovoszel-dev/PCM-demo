import { LegalDisclaimer } from "@/components/role-identifier/LegalDisclaimer";
import { RoleIdentifierWizard } from "@/components/role-identifier/RoleIdentifierWizard";
import { Badge } from "@/components/ui/badge";

export default function PpwrRoleIdentifierPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="ai">Regulation (EU) 2025/40 guided demo</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">PPWR Role Identifier</h1>
        <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
          Identify manufacturer, importer, distributor, producer/EPR, supplier and representative
          roles across packaging business scenarios.
        </p>
      </div>

      <LegalDisclaimer />
      <RoleIdentifierWizard />
    </div>
  );
}
