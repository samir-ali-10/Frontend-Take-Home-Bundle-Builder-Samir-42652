# Security System Bundle Builder

A production-minded React prototype of a multi-step security system bundle builder with a live review panel. Built as a take-home for assembling cameras, a monitoring plan, sensors, and accessories.

## Quick start

```bash
npm install
npm install --prefix client
npm run dev
```

That starts:

- **API** at [http://localhost:3001](http://localhost:3001) — serves `/api/catalog`
- **Web app** at [http://localhost:5173](http://localhost:5173) — Vite proxies `/api` to the API

Open the web URL and you should land on Step 1 expanded, with the review panel pre-filled to match the design seed data.

### Production build

```bash
npm run build
```

The built client lands in `client/dist`. The API remains a small Node/Express process (`npm start`).

## What's included

| Area | Notes |
| --- | --- |
| Builder accordion | 4 steps, Step 1 open on load, Next buttons advance |
| Product cards | Badge, image, copy, Learn More, variants, qty stepper, pricing |
| Variant quantities | Each color tracks its own qty; card stepper binds to the active chip |
| Review panel | Grouped line items, synced steppers, shipping, totals, savings |
| Persistence | **Save my system for later** writes to `localStorage` and restores on return |
| Data | Catalog JSON in `server/data/catalog.json` (API + client fallback copy) |

## Architecture

```
/
├── client/                 Vite + React + TypeScript
│   └── src/
│       ├── components/     Accordion, cards, review, chrome
│       ├── store/          Zustand cart + UI state (single source of truth)
│       ├── lib/            Pricing + localStorage helpers
│       └── data/           Fallback catalog if API is down
└── server/
    ├── index.js            Express catalog API
    └── data/catalog.json   Source of truth for products / seed selections
```

**State model:** quantities are keyed by `productId` or `productId::variantId`. Totals are always derived — never stored. Builder cards and review lines both call the same `setQuantity` action, so they stay in sync by design.

**Plans:** selecting a monitoring plan is mutually exclusive (one plan at a time). Hardware variants accumulate independently.

## Decisions & tradeoffs

1. **Small Express API** — Optional for the assignment, but it keeps the catalog out of the bundle and mirrors how this would ship. The client falls back to a bundled JSON copy if the API is unreachable, so the UI still boots during frontend-only work.
2. **Zustand over Context** — Flat action surface, no provider nesting, easy to read selectors. Enough for this scope without Redux ceremony.
3. **SVG product placeholders** — Figma used product photography we don't have rights to redistribute. Silhouettes keep layout fidelity without shipping scraped assets.
4. **DM Sans** — Close to the mock's clean grotesque feel without defaulting to Inter.
5. **Checkout** — Modal confirmation only; out of scope for a payment flow.
6. **Selected chip styling** — Functional selection works; chip “active” styling is intentionally light per the brief (“don't worry about selected-chip styling for now”).

## Persistence contract

Saved payload (`localStorage` key `wyze-bundle-builder:v1`):

```json
{
  "version": 1,
  "quantities": { "wyze-cam-v4::white": 1 },
  "activeVariants": { "wyze-cam-v4": "white" },
  "openStepId": "cameras",
  "savedAt": "ISO-8601"
}
```

If a saved payload exists on load, it wins over the catalog's `initialSelections`. Clear site data to reset to the design seed.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | API + Vite concurrently |
| `npm run dev:web` | Client only |
| `npm run dev:api` | API only |
| `npm run build` | Typecheck + production client build |
| `npm start` | Run API only |
