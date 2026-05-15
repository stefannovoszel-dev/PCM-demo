import type { AuditEvent, PackagingComponent, SupplierEvent } from "./types";
import { createAuditEvent } from "./audit";

function mergeDatapoints(component: PackagingComponent, event: SupplierEvent) {
  const additions = Object.keys(event.field_updates).map((field) =>
    field === "supplier_confirmed" ? "supplier_confirmation" : field
  );

  return [...new Set([...component.available_datapoints, ...additions, ...event.resolves_fields])];
}

export function applySupplierEvent(
  components: PackagingComponent[],
  event: SupplierEvent
): { components: PackagingComponent[]; auditEvent: AuditEvent } {
  let beforeValue: PackagingComponent | null = null;
  let afterValue: PackagingComponent | null = null;

  const updated = components.map((component) => {
    if (component.component_id !== event.component_id) return component;

    beforeValue = component;
    const missingFields = component.missing_fields.filter(
      (field) => !event.resolves_fields.includes(field)
    );
    afterValue = {
      ...component,
      ...event.field_updates,
      missing_fields: missingFields,
      available_datapoints: mergeDatapoints(component, event),
      data_quality_score: Math.min(100, component.data_quality_score + event.data_quality_delta),
      last_updated: event.timestamp
    };
    return afterValue;
  });

  const auditEvent = createAuditEvent(
    {
      actor: event.supplier_name,
      action_type:
        event.event_type === "certificate_upload" || event.event_type === "certificate_replacement"
          ? "Supplier uploaded certificate"
          : "Supplier playback event applied",
      object_type: "Component",
      object_id: event.component_id,
      before_value: beforeValue,
      after_value: afterValue,
      source: "Supplier playback simulator",
      comment: event.title
    },
    { event_id: `AUD-${event.event_id}`, timestamp: event.timestamp }
  );

  return { components: updated, auditEvent };
}
