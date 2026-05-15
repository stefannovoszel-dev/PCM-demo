import { SupplierEventCard } from "./SupplierEventCard";
import type { SupplierEvent } from "@/lib/types";

export function SupplierPlaybackTimeline({ events }: { events: SupplierEvent[] }) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <SupplierEventCard key={event.event_id} event={event} />
      ))}
    </div>
  );
}
