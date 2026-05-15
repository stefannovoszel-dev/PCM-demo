# Product Compliance Management Demo

Enterprise Next.js TypeScript demo for Product Compliance Management, focused on a fully implemented PPWR packaging compliance scenario.

## Purpose

The app simulates how fragmented product, packaging, supplier, document, and quality data is discovered, harmonised with ETL rules, enriched through deterministic AI-style matching, validated, converted into a **simulated osapiens-ready payload**, and improved through evidence intake events.

No real osapiens API is used. All data is local, static, and deterministic.

## Demo Scenario

- Regulation: PPWR
- Product: Sparkling Water 1L
- Product family: Beverages
- Market country: Germany / DE
- Packaging ID: PKG-7781
- Packaging components: PET Bottle, HDPE Cap Blue 28mm, PET Label, Shrink Film, Transport Box

## Tech Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS with shadcn/ui-style local components
- @xyflow/react / React Flow
- Recharts
- TanStack Table
- Zod
- Vitest
- Static JSON seed data

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tests

```bash
npm test
```

The tests cover transformations, duplicate matching, validation, readiness scoring, evidence intake, and simulated payload generation.

## How To Use The Demo

Start with the scenario selector, then move through readiness, evidence intake, product explorer, data discovery, inventory, ETL, AI matching, payload preview, and audit trail. Evidence intake raises readiness from the initial demo range by applying deterministic local evidence events.

The payload page is explicitly labeled **Simulated osapiens-ready payload**. It does not imply an official osapiens schema and does not call a real external service.

## PPWR Role Identifier

The **PPWR Role Identifier** module helps companies explore likely roles under Regulation (EU) 2025/40 across packaging business flows. It covers technical conformity roles, EPR producer responsibility, supplier data-provider duties, and marketplace or fulfilment verification relevance.

Use **Scenario Library** to run predefined cases such as domestic EU sales, intra-EU sales, third-country imports, non-EU direct-to-consumer sales, intra-group subsidiary flows, marketplace sales, fulfilment flows, private label changes, unpacking, supplier-only packaging flows, and export-only scenarios. Click **Analyse scenario** on any card to refresh the result panel.

Use **Guided Assessment** to create a custom scenario by selecting the company setup, Member States, transaction type, manufacturing/import flow, first making-available event, branding, packaging modification, marketplace, fulfilment, unpacking, logistics-only, and export-only indicators.

The result is a guided demo assessment, not legal advice or a legally binding conclusion. Final role allocation depends on the legal entity, Member State implementation, contractual setup, first making available, importer of record, ownership transfer, and actual business flow.

## Evidence Intake & Auto-Recalculation

The **Evidence Intake** module simulates new supplier, internal-system, document upload, email, ERP/PLM, and mock osapiens hub evidence events arriving for the packaging dataset. All events are local deterministic JSON records; no real external API is called.

Supported evidence includes recycled-content certificates, supplier material declarations, recyclability test reports, material composition statements, substances declarations, EPR registration numbers, declarations of conformity, packaging weight confirmations, supplier change notifications, audit documents, and technical documentation files.

Use `/evidence-intake` to simulate the next event, process all queued events, approve/reject pending-review evidence, and reset the demo. When evidence is accepted, the app updates compatible datapoints, links the document, re-runs validation, recalculates component and overall readiness, updates dashboard metrics, and writes audit-trail entries for evidence receipt, validation/application, review decisions, and score recalculation.

Pending review is triggered for low-confidence evidence, expired certificates, supplier change notifications that change existing values, or events explicitly flagged for review. This mirrors how the MVP could later connect to supplier portals, document management, osapiens hub events, email intake, or real APIs while keeping the current demo fully local.

## Extending Later

To add ESPR, EUDR, or CPR, add regulation-specific seed datapoints, validation rules, readiness weights if needed, and scenario data. The existing flow pages are regulation-aware enough to reuse the discovery, inventory, ETL, matching, evidence intake, and audit patterns.
