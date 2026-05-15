# Product Compliance Management Demo

Enterprise Next.js TypeScript demo for Product Compliance Management, focused on a fully implemented PPWR packaging compliance scenario.

## Purpose

The app simulates how fragmented product, packaging, supplier, document, and quality data is discovered, harmonised with ETL rules, enriched through deterministic AI-style matching, validated, converted into a **simulated osapiens-ready payload**, and improved through supplier playback events.

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

The tests cover transformations, duplicate matching, validation, readiness scoring, supplier playback, and simulated payload generation.

## How To Use The Demo

Start with the scenario selector, then move through readiness, product explorer, data discovery, inventory, ETL, AI matching, payload preview, supplier playback, and audit trail. Supplier playback raises readiness from the initial demo range to the post-playback target range by applying deterministic local events.

The payload page is explicitly labeled **Simulated osapiens-ready payload**. It does not imply an official osapiens schema and does not call a real external service.

## Extending Later

To add ESPR, EUDR, or CPR, add regulation-specific seed datapoints, validation rules, readiness weights if needed, and scenario data. The existing flow pages are regulation-aware enough to reuse the discovery, inventory, ETL, matching, supplier playback, and audit patterns.
