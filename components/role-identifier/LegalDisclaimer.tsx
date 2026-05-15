import { AlertTriangle } from "lucide-react";

export function LegalDisclaimer() {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        This role identification is a guided assessment based on the PPWR role logic. Final
        responsibility may depend on contractual setup, Member State implementation, actual
        placing-on-market flows, and legal review.
      </p>
    </div>
  );
}
