"use client";

import { useMemo, useRef, useState } from "react";
import { EvidenceEventSimulator } from "./EvidenceEventSimulator";
import { EvidenceImpactCard } from "./EvidenceImpactCard";
import { EvidenceQueue } from "./EvidenceQueue";
import { EvidenceTimeline } from "./EvidenceTimeline";
import { EvidenceValidationPanel } from "./EvidenceValidationPanel";
import { validateEvidenceEvent } from "@/lib/evidence-engine";
import { useDemoState } from "@/lib/demo-state";

export function EvidenceIntakePanel() {
  const {
    product,
    components,
    evidenceEvents,
    evidenceDocuments,
    auditEvents,
    lastEvidenceResult,
    lastEvidenceValidation,
    pendingEvidenceReviewCount,
    processNextEvidenceEvent,
    processAllEvidenceEvents,
    approveEvidenceEvent,
    rejectEvidenceEvent,
    resetSimulation
  } = useDemoState();
  const [selectedEventId, setSelectedEventId] = useState(evidenceEvents[0]?.event_id);
  const validationRef = useRef<HTMLDivElement>(null);
  const selectedEvent = evidenceEvents.find((event) => event.event_id === selectedEventId) ?? evidenceEvents[0];
  const selectedComponent = selectedEvent?.component_id
    ? components.find((component) => component.component_id === selectedEvent.component_id)
    : undefined;
  const selectedScoreChange =
    lastEvidenceResult &&
    lastEvidenceResult.validation.event_id === selectedEvent?.event_id
      ? lastEvidenceResult.scoreChange
      : undefined;

  const validation = useMemo(() => {
    if (!selectedEvent) return lastEvidenceValidation;
    if (lastEvidenceValidation?.event_id === selectedEvent.event_id) return lastEvidenceValidation;
    return validateEvidenceEvent(selectedEvent, {
      products: [product],
      components,
      evidenceEvents,
      evidenceDocuments,
      auditEvents
    });
  }, [auditEvents, components, evidenceDocuments, evidenceEvents, lastEvidenceValidation, product, selectedEvent]);

  function reviewPending() {
    const pending = evidenceEvents.find((event) => event.evidence_status === "needs_review");
    if (pending) setSelectedEventId(pending.event_id);
  }

  function scrollToValidation() {
    window.requestAnimationFrame(() => {
      validationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-6">
      <EvidenceEventSimulator
        onNext={processNextEvidenceEvent}
        onAll={processAllEvidenceEvents}
        onReset={resetSimulation}
        onReviewPending={reviewPending}
        pendingCount={pendingEvidenceReviewCount}
      />

      <EvidenceQueue
        events={evidenceEvents}
        selectedEventId={selectedEvent?.event_id}
        onApprove={(eventId) => {
          const scrollY = window.scrollY;
          setSelectedEventId(eventId);
          approveEvidenceEvent(eventId);
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: scrollY, behavior: "auto" });
          });
        }}
        onReject={(eventId) => {
          setSelectedEventId(eventId);
          rejectEvidenceEvent(eventId, "Rejected from evidence intake queue.");
          scrollToValidation();
        }}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <EvidenceImpactCard
            event={selectedEvent}
            scoreChange={selectedScoreChange}
            product={product}
            component={selectedComponent}
          />
        </div>
        <div ref={validationRef}>
          <EvidenceValidationPanel validation={validation} />
        </div>
      </div>

      <EvidenceTimeline events={evidenceEvents} />
    </div>
  );
}
