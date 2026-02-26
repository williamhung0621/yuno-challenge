# Luxara Decline Analytics Dashboard

A full-stack payment decline analytics tool built for Luxara — a luxury fashion marketplace losing ~$200K/month to unexplained payment failures. The dashboard gives their payments team real-time visibility into decline patterns so they can diagnose root causes and recover revenue before the holiday season.

---

## Quick Start

**Prerequisites:** Node.js 18+ (or Bun)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No database, environment variables, or external services required — the app seeds its own transaction data on startup.

---

## Architecture Overview

The application is a single Next.js project that handles both the API and the frontend. Transaction data is generated in memory at server startup via a deterministic seed script (`lib/data/seed.ts`) that produces 614 realistic transactions spanning 21 days, with embedded crisis patterns (a processor with an 80% decline rate, a spike in `issuer_unavailable` errors in the final week). This avoids any database dependency while still supporting the full analytics query surface.

The backend is four Next.js Route Handler endpoints (`/api/analytics/overview`, `/api/analytics/breakdown`, `/api/analytics/timeseries`, `/api/analytics/decline-codes`). Each endpoint accepts the same set of filter query parameters, pipes them through a shared `applyFilters` function, and then calls a purpose-built aggregation function. All business logic lives in `lib/analytics/` — cleanly separated from both the HTTP layer and the UI.

On the frontend, filter state lives entirely in the URL query string (managed by `useFilters` via Next.js `useSearchParams`/`useRouter`). This means every filtered view is shareable and bookmarkable by default. Each chart and metric card has its own data hook that re-fetches from the API whenever the URL changes, keeping the components stateless and simple.

---

## Tech Stack Choices

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Co-locates API routes and React UI in one project — no separate backend to run |
| Language | TypeScript | Shared types between API responses and frontend components catch mismatches at compile time |
| Styling | Tailwind CSS v4 | Utility-first approach is fast for building dense data UIs; v4's CSS variables make dark/light theming trivial |
| Charts | Recharts | Composable React chart primitives; good support for multi-series line charts and custom tooltips |
| Components | shadcn/ui | Unstyled, accessible component primitives (Select, Table, Card) that don't fight the custom design |
| Date utilities | date-fns | Lightweight, tree-shakeable; `eachDayOfInterval` and `format` cover all the time-series bucketing needs |
| Data layer | In-memory (seed script) | Appropriate for a self-contained demo; swapping in a real DB means replacing `lib/data/store.ts` only |

---

## Key Insights in the Data

The seed data is designed to surface three actionable findings:

1. **LatamPay is the primary culprit.** It carries a ~75–80% decline rate while the other three processors (AcquireMax, Kushki, dLocal) sit at 28–38%. Visible immediately in the "Decline Rate by Dimension → Processor" bar chart.

2. **A processing crisis started around day 15.** `issuer_unavailable` — a processing error code — jumps to ~40% of all declines in the final week (days 15–21), up from near zero in the baseline period. The time-series chart split by processor makes the onset date clear.

3. **Three card BINs have disproportionately high decline rates.** BINs `400001`, `400002`, and `400003` carry a ~90%+ decline rate, suggesting a specific issuing bank or card product is being systematically rejected. Visible in the breakdown chart with dimension set to "Card BIN".

---

## Feature Walkthrough

### Filtering (sidebar)
Apply any combination of filters — all charts and metrics update in real time:
- **Processor** — isolate a single acquirer (try "LatamPay" to see the full crisis)
- **Payment Method** — compare card vs. PIX vs. OXXO
- **Country** — MX, CO, AR, BR
- **Decline Category** — soft decline / hard decline / processing error
- **Decline Code** — drill into a specific reason (e.g. `issuer_unavailable`)
- **Card BIN** — type a 6-digit BIN and press Enter to filter to that issuing bank
- **Date Range** — scope to any sub-period within the 21-day window

### Breakdown Chart
Bar chart showing decline rate for each value in a chosen dimension. Red bars indicate >60% decline rate. Use the dimension selector to switch between Processor, Payment Method, Country, Decline Category, Decline Code, and Card BIN.

### Time-Series Chart
Line chart of daily decline rate. Use the group-by selector to split by processor, payment method, or country to see which group drove the spike. The dashed reference line marks the 22% healthy baseline.

### Top Decline Codes Table
Ranked table of the 10 most common decline codes in the current filter set, showing count, % of total declines, category badge, and the top processors associated with each code. Updates with every filter change.

### Metrics Row
Four summary cards at the top — total transactions, decline rate, approval rate, and total volume — reflecting the currently filtered data set.

---

## File Structure

```
app/
  page.tsx                          # Entry point (wraps DashboardShell in Suspense)
  layout.tsx                        # Root layout
  api/analytics/
    overview/route.ts               # GET /api/analytics/overview
    breakdown/route.ts              # GET /api/analytics/breakdown
    timeseries/route.ts             # GET /api/analytics/timeseries
    decline-codes/route.ts          # GET /api/analytics/decline-codes

lib/
  data/
    types.ts                        # Transaction type definitions
    seed.ts                         # Generates 614 transactions with realistic patterns
    store.ts                        # Singleton that holds the in-memory dataset
  analytics/
    filters.ts                      # applyFilters() — shared across all endpoints
    aggregations.ts                 # Per-endpoint aggregation functions
    utils.ts                        # filtersToQueryString(), chart colour palette

components/
  dashboard/
    DashboardShell.tsx              # Layout: sidebar + main content + theme toggle
    FilterPanel.tsx                 # All filter controls
    MetricsRow.tsx                  # Summary metric cards
    BreakdownChart.tsx              # Bar chart by dimension
    TimeSeriesChart.tsx             # Line chart over time
    DeclineCodesTable.tsx           # Top decline codes ranked table
  ui/                               # shadcn/ui primitives

hooks/
  useFilters.ts                     # URL query string ↔ FilterParams
  useOverview.ts                    # Fetches /api/analytics/overview
  useBreakdown.ts                   # Fetches /api/analytics/breakdown
  useTimeSeries.ts                  # Fetches /api/analytics/timeseries
  useDeclineCodes.ts                # Fetches /api/analytics/decline-codes

types/
  analytics.ts                      # Shared FilterParams + API response types
```

---

## Assumptions

- **Date range:** All 614 transactions fall within January 1–21, 2025. This window was chosen to be self-contained and clearly show both a "before" baseline and the crisis period.
- **Currencies are country-fixed:** MXN for MX, COP for CO, ARS for AR, BRL for BR. Cross-border transactions and FX conversion are out of scope.
- **BINs are first 6 digits of card number only.** PIX, OXXO, and PSE transactions have no BIN.
- **"Approval rate dropped from 78% to 62%"** — the seed reflects this arc: early days sit near 68–72% approval, the final week drops to ~55–60% as the LatamPay and issuer_unavailable problems compound.
- **No authentication or multi-tenancy** — this is a single-tenant diagnostic tool for one merchant.

---

## Production Considerations

To evolve this into a production-grade service:

- **Persistence:** Replace `lib/data/store.ts` with a time-series database (TimescaleDB or ClickHouse). The aggregation logic in `lib/analytics/` maps directly to SQL `GROUP BY` queries.
- **Streaming ingestion:** Consume a Kafka or webhook event stream from Yuno's transaction processor to make the dashboard truly real-time.
- **Caching:** The overview and breakdown endpoints are read-heavy and deterministic for a given time window — a short TTL cache (Redis or Next.js `revalidate`) would cut DB load significantly.
- **Auth:** Add SSO (e.g. Auth.js with an OIDC provider) so the dashboard is scoped per merchant.
- **Alerting:** The `issuer_unavailable` spike pattern is machine-detectable — a simple rule (e.g. "code exceeds 20% of declines in a 1-hour window") could fire a PagerDuty alert automatically.
