"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import auditData from "@/data/audit-events.json";
import matchData from "@/data/ai-match-candidates.json";
import componentData from "@/data/packaging-components.json";
import productData from "@/data/products.json";
import supplierEventData from "@/data/supplier-events.json";
import { appendAuditEvent, createAuditEvent } from "./audit";
import { calculateMatchConfidence } from "./matching";
import { calculateReadiness, type ReadinessBreakdown } from "./scoring";
import { applySupplierEvent } from "./supplier-playback";
import type { AiMatchCandidate, AuditEvent, PackagingComponent, Product, SupplierEvent } from "./types";

const initialComponents = componentData as unknown as PackagingComponent[];
const initialProducts = productData as unknown as Product[];
const initialSupplierEvents = supplierEventData as unknown as SupplierEvent[];
const initialAuditEvents = auditData as unknown as AuditEvent[];
const initialMatchCandidates = matchData as unknown as AiMatchCandidate[];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

interface DemoState {
  product: Product;
  components: PackagingComponent[];
  matchCandidates: AiMatchCandidate[];
  supplierEvents: SupplierEvent[];
  auditEvents: AuditEvent[];
  initialReadiness: ReadinessBreakdown;
  readiness: ReadinessBreakdown;
  appliedSupplierEventCount: number;
  acceptMatch: (id: string) => void;
  rejectMatch: (id: string) => void;
  createAlias: (id: string) => void;
  requestSupplierConfirmation: (id: string) => void;
  applyNextSupplierEvent: () => void;
  playSupplierEvents: () => void;
  resetSimulation: () => void;
  recordAuditEvent: (event: Omit<AuditEvent, "event_id" | "timestamp">) => void;
}

const DemoStateContext = createContext<DemoState | null>(null);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [components, setComponents] = useState(() => clone(initialComponents));
  const [supplierEvents, setSupplierEvents] = useState(() => clone(initialSupplierEvents));
  const [auditEvents, setAuditEvents] = useState(() => clone(initialAuditEvents));
  const [matchCandidates, setMatchCandidates] = useState(() => clone(initialMatchCandidates));
  const auditSequence = useRef(1000);

  const product = initialProducts[0];

  const nextAuditOptions = useCallback(() => {
    auditSequence.current += 1;
    const minute = auditSequence.current - 1000;
    return {
      event_id: `AUD-${auditSequence.current}`,
      timestamp: new Date(Date.UTC(2026, 4, 6, 13, minute, 0)).toISOString()
    };
  }, []);

  const recordAuditEvent = useCallback(
    (event: Omit<AuditEvent, "event_id" | "timestamp">) => {
      setAuditEvents((current) =>
        appendAuditEvent(
          current,
          createAuditEvent(
            {
              actor: event.actor,
              action_type: event.action_type,
              object_type: event.object_type,
              object_id: event.object_id,
              before_value: event.before_value,
              after_value: event.after_value,
              source: event.source,
              comment: event.comment
            },
            nextAuditOptions()
          )
        )
      );
    },
    [nextAuditOptions]
  );

  const updateMatch = useCallback(
    (id: string, status: AiMatchCandidate["status"], actionType: string) => {
      const candidate = matchCandidates.find((match) => match.id === id);
      if (!candidate) return;

      const recalculated = calculateMatchConfidence(candidate.candidate_a, candidate.candidate_b);
      setMatchCandidates((current) =>
        current.map((match) =>
          match.id === id
            ? {
                ...match,
                ...recalculated,
                status
              }
            : match
        )
      );

      if (status === "Accepted" || status === "Alias Created") {
        const componentId = candidate.candidate_a.component_id;
        const alias = candidate.candidate_b.component_name;
        if (componentId && alias) {
          setComponents((current) =>
            current.map((component) =>
              component.component_id === componentId
                ? {
                    ...component,
                    canonical_component_name: recalculated.suggested_canonical_name,
                    aliases: [...new Set([...component.aliases, alias])],
                    missing_fields: component.missing_fields.filter(
                      (field) => field !== "supplier_alias_confirmation"
                    )
                  }
                : component
            )
          );
        }
      }

      recordAuditEvent({
        actor: status === "Accepted" ? "Data Steward" : "Data Steward",
        action_type: actionType,
        object_type: "Component",
        object_id: candidate.candidate_a.component_id ?? candidate.id,
        before_value: candidate.candidate_b.component_name,
        after_value: recalculated.suggested_canonical_name,
        source: "AI matching console",
        comment: `${status}: ${recalculated.reason}`
      });
    },
    [matchCandidates, recordAuditEvent]
  );

  const acceptMatch = useCallback(
    (id: string) => updateMatch(id, "Accepted", "Data steward accepted match"),
    [updateMatch]
  );
  const rejectMatch = useCallback(
    (id: string) => updateMatch(id, "Rejected", "Data steward rejected match"),
    [updateMatch]
  );
  const createAlias = useCallback(
    (id: string) => updateMatch(id, "Alias Created", "Data steward created alias"),
    [updateMatch]
  );
  const requestSupplierConfirmation = useCallback(
    (id: string) =>
      updateMatch(id, "Supplier Confirmation Requested", "Supplier confirmation requested"),
    [updateMatch]
  );

  const applyEvents = useCallback(
    (eventsToApply: SupplierEvent[]) => {
      if (!eventsToApply.length) return;

      let nextComponents = components;
      const generatedAuditEvents: AuditEvent[] = [];

      for (const event of eventsToApply) {
        const result = applySupplierEvent(nextComponents, event);
        nextComponents = result.components;
        generatedAuditEvents.push(result.auditEvent);
      }

      setComponents(nextComponents);
      setAuditEvents((currentAudit) => [...generatedAuditEvents.reverse(), ...currentAudit]);
      setSupplierEvents((current) =>
        current.map((event) =>
          eventsToApply.some((applied) => applied.event_id === event.event_id)
            ? { ...event, status: "Applied" }
            : event
        )
      );
    },
    [components]
  );

  const applyNextSupplierEvent = useCallback(() => {
    const nextEvent = supplierEvents.find((event) => event.status === "Queued");
    if (nextEvent) applyEvents([nextEvent]);
  }, [applyEvents, supplierEvents]);

  const playSupplierEvents = useCallback(() => {
    applyEvents(supplierEvents.filter((event) => event.status === "Queued"));
  }, [applyEvents, supplierEvents]);

  const resetSimulation = useCallback(() => {
    setComponents(clone(initialComponents));
    setSupplierEvents(clone(initialSupplierEvents));
    setAuditEvents(clone(initialAuditEvents));
    setMatchCandidates(clone(initialMatchCandidates));
    auditSequence.current = 1000;
  }, []);

  const initialReadiness = useMemo(() => calculateReadiness(initialComponents), []);
  const readiness = useMemo(() => calculateReadiness(components), [components]);
  const appliedSupplierEventCount = supplierEvents.filter((event) => event.status === "Applied").length;

  const value = useMemo(
    () => ({
      product,
      components,
      matchCandidates,
      supplierEvents,
      auditEvents,
      initialReadiness,
      readiness,
      appliedSupplierEventCount,
      acceptMatch,
      rejectMatch,
      createAlias,
      requestSupplierConfirmation,
      applyNextSupplierEvent,
      playSupplierEvents,
      resetSimulation,
      recordAuditEvent
    }),
    [
      product,
      components,
      matchCandidates,
      supplierEvents,
      auditEvents,
      initialReadiness,
      readiness,
      appliedSupplierEventCount,
      acceptMatch,
      rejectMatch,
      createAlias,
      requestSupplierConfirmation,
      applyNextSupplierEvent,
      playSupplierEvents,
      resetSimulation,
      recordAuditEvent
    ]
  );

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}

export function useDemoState() {
  const context = useContext(DemoStateContext);
  if (!context) {
    throw new Error("useDemoState must be used within DemoStateProvider");
  }
  return context;
}
