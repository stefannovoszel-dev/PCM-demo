"use client";

import type { MouseEvent } from "react";
import { Check, MessageSquare, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoState } from "@/lib/demo-state";

export function MatchActionButtons({ id }: { id: string }) {
  const { acceptMatch, rejectMatch, createAlias, requestSupplierConfirmation } = useDemoState();
  const handleAction = (event: MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.stopPropagation();
    action();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="success" onClick={(event) => handleAction(event, () => acceptMatch(id))}>
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Accept
      </Button>
      <Button size="sm" variant="outline" onClick={(event) => handleAction(event, () => rejectMatch(id))}>
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Reject
      </Button>
      <Button size="sm" variant="secondary" onClick={(event) => handleAction(event, () => createAlias(id))}>
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Alias
      </Button>
      <Button size="sm" variant="ghost" onClick={(event) => handleAction(event, () => requestSupplierConfirmation(id))}>
        <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
        Confirm
      </Button>
    </div>
  );
}
