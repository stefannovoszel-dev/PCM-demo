"use client";

import { Check, MessageSquare, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoState } from "@/lib/demo-state";

export function MatchActionButtons({ id }: { id: string }) {
  const { acceptMatch, rejectMatch, createAlias, requestSupplierConfirmation } = useDemoState();

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="success" onClick={() => acceptMatch(id)}>
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Accept
      </Button>
      <Button size="sm" variant="outline" onClick={() => rejectMatch(id)}>
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Reject
      </Button>
      <Button size="sm" variant="secondary" onClick={() => createAlias(id)}>
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Alias
      </Button>
      <Button size="sm" variant="ghost" onClick={() => requestSupplierConfirmation(id)}>
        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
        Confirm
      </Button>
    </div>
  );
}
