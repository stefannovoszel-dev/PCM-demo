import type { AuditEvent } from "./types";

interface AuditEventInput {
  actor: string;
  action_type: string;
  object_type: string;
  object_id: string;
  before_value?: unknown;
  after_value?: unknown;
  source: string;
  comment: string;
}

export function createAuditEvent(
  input: AuditEventInput,
  options: { event_id?: string; timestamp?: string } = {}
): AuditEvent {
  return {
    event_id: options.event_id ?? `AUD-${Date.now()}`,
    timestamp: options.timestamp ?? new Date().toISOString(),
    actor: input.actor,
    action_type: input.action_type,
    object_type: input.object_type,
    object_id: input.object_id,
    before_value: input.before_value ?? null,
    after_value: input.after_value ?? null,
    source: input.source,
    comment: input.comment
  };
}

export function appendAuditEvent(events: AuditEvent[], event: AuditEvent) {
  return [event, ...events];
}

export function formatAuditEvent(event: AuditEvent) {
  return `${event.timestamp} | ${event.actor} | ${event.action_type} | ${event.object_type}:${event.object_id}`;
}
