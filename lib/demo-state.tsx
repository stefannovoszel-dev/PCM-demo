"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import auditData from "@/data/audit-events.json";
import componentData from "@/data/packaging-components.json";
import productData from "@/data/products.json";
import rawErpData from "@/data/raw-erp-records.json";
import rawPlmData from "@/data/raw-plm-records.json";
import rawSupplierData from "@/data/raw-supplier-records.json";
import { appendAuditEvent, createAuditEvent } from "./audit";
import { initialEvidenceDocuments, initialEvidenceEvents } from "./evidence-events";
import {
  approveEvidenceEvent as approveEvidenceEventInEngine,
  processIncomingEvidence,
  rejectEvidenceEvent as rejectEvidenceEventInEngine,
  validateEvidenceEvent
} from "./evidence-engine";
import {
  applyCandidateANameToHarmonisedRows,
  calculateMatchConfidence,
  createAiMatchCandidatesFromHarmonisedRows
} from "./matching";
import { calculateReadiness, type ReadinessBreakdown } from "./scoring";
import { buildHarmonisedDataRows, type HarmonisedDataRow } from "./transformations";
import type {
  EvidenceDocument,
  EvidenceEvent,
  EvidenceProcessingResult,
  EvidenceProcessingState,
  EvidenceValidationResult,
  ScoreChange
} from "./evidence-types";
import type { AiMatchCandidate, AuditEvent, PackagingComponent, Product } from "./types";

const initialComponents = componentData as unknown as PackagingComponent[];
const initialProducts = productData as unknown as Product[];
const initialAuditEvents = auditData as unknown as AuditEvent[];
const initialHarmonisedRows = buildHarmonisedDataRows({
  erpRecords: rawErpData as unknown as Record<string, unknown>[],
  plmRecords: rawPlmData as unknown as Record<string, unknown>[],
  supplierRecords: rawSupplierData as unknown as Record<string, unknown>[]
});
const initialMatchCandidates = createAiMatchCandidatesFromHarmonisedRows(initialComponents, initialHarmonisedRows);
const ETL_AI_SYNC_STORAGE_KEY = "pcm-demo-etl-ai-sync-v1";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadPersistedEtlAiSyncState() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(ETL_AI_SYNC_STORAGE_KEY);
    if (!value) return null;

    const parsed = JSON.parse(value) as {
      harmonisedRows?: HarmonisedDataRow[];
      matchCandidates?: AiMatchCandidate[];
    };

    if (!Array.isArray(parsed.harmonisedRows) || !Array.isArray(parsed.matchCandidates)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

interface DemoState {
  product: Product;
  components: PackagingComponent[];
  harmonisedRows: HarmonisedDataRow[];
  matchCandidates: AiMatchCandidate[];
  auditEvents: AuditEvent[];
  evidenceEvents: EvidenceEvent[];
  evidenceDocuments: EvidenceDocument[];
  scoreChanges: ScoreChange[];
  lastScoreChange?: ScoreChange;
  lastEvidenceResult?: EvidenceProcessingResult;
  lastEvidenceValidation?: EvidenceValidationResult;
  initialReadiness: ReadinessBreakdown;
  readiness: ReadinessBreakdown;
  autoAppliedEvidenceEventCount: number;
  pendingEvidenceReviewCount: number;
  acceptMatch: (id: string) => void;
  rejectMatch: (id: string) => void;
  createAlias: (id: string) => void;
  requestSupplierConfirmation: (id: string) => void;
  updateHarmonisedRowName: (harmonisedRowId: string, componentName: string) => void;
  processEvidenceEvent: (eventId: string) => void;
  processNextEvidenceEvent: () => void;
  processAllEvidenceEvents: () => void;
  approveEvidenceEvent: (eventId: string) => void;
  rejectEvidenceEvent: (eventId: string, reason?: string) => void;
  validateEvidenceEventById: (eventId: string) => EvidenceValidationResult | undefined;
  resetSimulation: () => void;
  resetDemoState: () => void;
  getCurrentReadiness: () => ReadinessBreakdown;
  getEvidenceQueue: () => EvidenceEvent[];
  getAuditEvents: () => AuditEvent[];
  recordAuditEvent: (event: Omit<AuditEvent, "event_id" | "timestamp">) => void;
}

const DemoStateContext = createContext<DemoState | null>(null);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [persistedEtlAiSyncState] = useState(() => loadPersistedEtlAiSyncState());
  const [components, setComponents] = useState(() => clone(initialComponents));
  const [harmonisedRows, setHarmonisedRows] = useState(() =>
    clone(persistedEtlAiSyncState?.harmonisedRows ?? initialHarmonisedRows)
  );
  const [evidenceEvents, setEvidenceEvents] = useState(() => clone(initialEvidenceEvents));
  const [evidenceDocuments, setEvidenceDocuments] = useState(() => clone(initialEvidenceDocuments));
  const [auditEvents, setAuditEvents] = useState(() => clone(initialAuditEvents));
  const [matchCandidates, setMatchCandidates] = useState(() =>
    clone(persistedEtlAiSyncState?.matchCandidates ?? initialMatchCandidates)
  );
  const [scoreChanges, setScoreChanges] = useState<ScoreChange[]>([]);
  const [lastEvidenceResult, setLastEvidenceResult] = useState<EvidenceProcessingResult | undefined>();
  const [lastEvidenceValidation, setLastEvidenceValidation] = useState<EvidenceValidationResult | undefined>();
  const auditSequence = useRef(1000);

  const product = initialProducts[0];

  useEffect(() => {
    window.localStorage.setItem(
      ETL_AI_SYNC_STORAGE_KEY,
      JSON.stringify({
        harmonisedRows,
        matchCandidates
      })
    );
  }, [harmonisedRows, matchCandidates]);

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

      const acceptedName = candidate.candidate_a.component_name.trim();
      const shouldSyncAcceptedName = status === "Accepted" && Boolean(candidate.candidate_b.harmonised_row_id && acceptedName);
      const nextCandidateB = shouldSyncAcceptedName
        ? {
            ...candidate.candidate_b,
            component_name: acceptedName
          }
        : candidate.candidate_b;
      const recalculated = calculateMatchConfidence(candidate.candidate_a, nextCandidateB);

      if (shouldSyncAcceptedName) {
        setHarmonisedRows((current) => applyCandidateANameToHarmonisedRows(current, candidate));
      }

      setMatchCandidates((current) =>
        current.map((match) =>
          match.id === id
            ? {
                ...match,
                candidate_b: nextCandidateB,
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
        after_value: shouldSyncAcceptedName ? acceptedName : recalculated.suggested_canonical_name,
        source: "AI matching console",
        comment: shouldSyncAcceptedName
          ? `${status}: harmonised ETL name synced to Candidate A (${acceptedName}).`
          : `${status}: ${recalculated.reason}`
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

  const updateHarmonisedRowName = useCallback(
    (harmonisedRowId: string, componentName: string) => {
      const trimmedName = componentName.trim();
      if (!trimmedName) return;

      const currentRow = harmonisedRows.find((row) => row.harmonised_row_id === harmonisedRowId);
      if (!currentRow || currentRow.component_name === trimmedName) return;

      const nextRows = harmonisedRows.map((row) =>
        row.harmonised_row_id === harmonisedRowId
          ? {
              ...row,
              component_name: trimmedName
            }
          : row
      );

      setHarmonisedRows(nextRows);
      setMatchCandidates((current) => {
        const regenerated = createAiMatchCandidatesFromHarmonisedRows(components, nextRows);
        return regenerated.map((candidate) => ({
          ...candidate,
          status: current.find((match) => match.id === candidate.id)?.status ?? candidate.status
        }));
      });
      recordAuditEvent({
        actor: "Data Steward",
        action_type: "Harmonised component naming updated",
        object_type: "Harmonised row",
        object_id: harmonisedRowId,
        before_value: currentRow.component_name,
        after_value: trimmedName,
        source: "AI matching console",
        comment: "Custom harmonised component name synced back to ETL Pipeline."
      });
    },
    [components, harmonisedRows, recordAuditEvent]
  );

  const buildEvidenceState = useCallback(
    (): EvidenceProcessingState => ({
      products: initialProducts,
      components,
      evidenceEvents,
      evidenceDocuments,
      auditEvents
    }),
    [auditEvents, components, evidenceDocuments, evidenceEvents]
  );

  const commitEvidenceResult = useCallback((result: EvidenceProcessingResult) => {
    setComponents(result.state.components);
    setEvidenceEvents(result.state.evidenceEvents);
    setEvidenceDocuments(result.state.evidenceDocuments);
    setAuditEvents(result.state.auditEvents);
    setScoreChanges((current) => [result.scoreChange, ...current]);
    setLastEvidenceResult(result);
    setLastEvidenceValidation(result.validation);
  }, []);

  const processEvidenceEvent = useCallback(
    (eventId: string) => {
      const event = evidenceEvents.find((item) => item.event_id === eventId);
      if (!event) return;
      const result = processIncomingEvidence(event, buildEvidenceState());
      commitEvidenceResult(result);
    },
    [buildEvidenceState, commitEvidenceResult, evidenceEvents]
  );

  const processNextEvidenceEvent = useCallback(() => {
    const nextEvent = evidenceEvents.find((event) => event.evidence_status === "received");
    if (!nextEvent) return;
    const result = processIncomingEvidence(nextEvent, buildEvidenceState());
    commitEvidenceResult(result);
  }, [buildEvidenceState, commitEvidenceResult, evidenceEvents]);

  const processAllEvidenceEvents = useCallback(() => {
    const eventsToProcess = evidenceEvents.filter((event) => event.evidence_status === "received");
    if (!eventsToProcess.length) return;

    let state = buildEvidenceState();
    let lastResult: EvidenceProcessingResult | undefined;
    const changes: ScoreChange[] = [];
    for (const event of eventsToProcess) {
      lastResult = processIncomingEvidence(event, state);
      state = lastResult.state;
      changes.push(lastResult.scoreChange);
    }

    if (lastResult) {
      setComponents(state.components);
      setEvidenceEvents(state.evidenceEvents);
      setEvidenceDocuments(state.evidenceDocuments);
      setAuditEvents(state.auditEvents);
      setScoreChanges((current) => [...changes.reverse(), ...current]);
      setLastEvidenceResult(lastResult);
      setLastEvidenceValidation(lastResult.validation);
    }
  }, [buildEvidenceState, evidenceEvents]);

  const approveEvidenceEvent = useCallback(
    (eventId: string) => {
      const event = evidenceEvents.find((item) => item.event_id === eventId);
      if (!event) return;
      const result = approveEvidenceEventInEngine(event, buildEvidenceState());
      commitEvidenceResult(result);
    },
    [buildEvidenceState, commitEvidenceResult, evidenceEvents]
  );

  const rejectEvidenceEvent = useCallback(
    (eventId: string, reason = "Rejected during evidence review.") => {
      const event = evidenceEvents.find((item) => item.event_id === eventId);
      if (!event) return;
      const result = rejectEvidenceEventInEngine(event, buildEvidenceState(), reason);
      commitEvidenceResult(result);
    },
    [buildEvidenceState, commitEvidenceResult, evidenceEvents]
  );

  const validateEvidenceEventById = useCallback(
    (eventId: string) => {
      const event = evidenceEvents.find((item) => item.event_id === eventId);
      if (!event) return undefined;
      const validation = validateEvidenceEvent(event, buildEvidenceState());
      setLastEvidenceValidation(validation);
      setEvidenceEvents((current) =>
        current.map((item) =>
          item.event_id === eventId
            ? {
                ...item,
                evidence_status: validation.status
              }
            : item
        )
      );
      if (event.evidence_status !== validation.status) {
        const actionType =
          validation.status === "validated"
            ? "evidence validated"
            : validation.status === "needs_review"
              ? "evidence pending review"
              : "evidence rejected";
        setAuditEvents((current) =>
          appendAuditEvent(
            current,
            createAuditEvent(
              {
                actor: "System",
                action_type: actionType,
                object_type: "Evidence",
                object_id: event.event_id,
                before_value: event.evidence_status,
                after_value: validation.status,
                source: "Evidence intake simulator",
                comment: validation.messages[0] ?? "Evidence validation completed."
              },
              nextAuditOptions()
            )
          )
        );
      }
      return validation;
    },
    [buildEvidenceState, evidenceEvents, nextAuditOptions]
  );

  const resetSimulation = useCallback(() => {
    setComponents(clone(initialComponents));
    setHarmonisedRows(clone(initialHarmonisedRows));
    setEvidenceEvents(clone(initialEvidenceEvents));
    setEvidenceDocuments(clone(initialEvidenceDocuments));
    setAuditEvents(clone(initialAuditEvents));
    setMatchCandidates(clone(initialMatchCandidates));
    setScoreChanges([]);
    setLastEvidenceResult(undefined);
    setLastEvidenceValidation(undefined);
    auditSequence.current = 1000;
  }, []);

  const initialReadiness = useMemo(() => calculateReadiness(initialComponents, undefined, initialEvidenceDocuments), []);
  const readiness = useMemo(() => calculateReadiness(components, undefined, evidenceDocuments), [components, evidenceDocuments]);
  const autoAppliedEvidenceEventCount = evidenceEvents.filter((event) => event.evidence_status === "applied").length;
  const pendingEvidenceReviewCount = evidenceEvents.filter((event) => event.evidence_status === "needs_review").length;
  const lastScoreChange = scoreChanges[0];
  const getCurrentReadiness = useCallback(() => readiness, [readiness]);
  const getEvidenceQueue = useCallback(() => evidenceEvents, [evidenceEvents]);
  const getAuditEvents = useCallback(() => auditEvents, [auditEvents]);

  const value = useMemo(
    () => ({
      product,
      components,
      harmonisedRows,
      matchCandidates,
      evidenceEvents,
      evidenceDocuments,
      auditEvents,
      scoreChanges,
      lastScoreChange,
      lastEvidenceResult,
      lastEvidenceValidation,
      initialReadiness,
      readiness,
      autoAppliedEvidenceEventCount,
      pendingEvidenceReviewCount,
      acceptMatch,
      rejectMatch,
      createAlias,
      requestSupplierConfirmation,
      updateHarmonisedRowName,
      processEvidenceEvent,
      processNextEvidenceEvent,
      processAllEvidenceEvents,
      approveEvidenceEvent,
      rejectEvidenceEvent,
      validateEvidenceEventById,
      resetSimulation,
      resetDemoState: resetSimulation,
      getCurrentReadiness,
      getEvidenceQueue,
      getAuditEvents,
      recordAuditEvent
    }),
    [
      product,
      components,
      harmonisedRows,
      matchCandidates,
      evidenceEvents,
      evidenceDocuments,
      auditEvents,
      scoreChanges,
      lastScoreChange,
      lastEvidenceResult,
      lastEvidenceValidation,
      initialReadiness,
      readiness,
      autoAppliedEvidenceEventCount,
      pendingEvidenceReviewCount,
      acceptMatch,
      rejectMatch,
      createAlias,
      requestSupplierConfirmation,
      updateHarmonisedRowName,
      processEvidenceEvent,
      processNextEvidenceEvent,
      processAllEvidenceEvents,
      approveEvidenceEvent,
      rejectEvidenceEvent,
      validateEvidenceEventById,
      resetSimulation,
      getCurrentReadiness,
      getEvidenceQueue,
      getAuditEvents,
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
