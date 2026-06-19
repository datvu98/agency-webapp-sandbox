# Report

## Overview
Analytics and reporting overview for agency operators.

## Capabilities
- Business metrics and KPI dashboards
- Report overview across fulfillment, settlement, and warehouse domains

## Pages
| Page | Path |
|------|------|
| `Report` | `/report/*` |

## Context
`src/app/contexts/` — `ReportContext` provides shared date range and filter state across report sub-pages.

## Stack
Uses `@ant-design/plots` (Ant Design charting library built on G2) for all chart renders.

## Access
- Agency users only

## Open Questions
- [ ] What report types exist? (revenue, order volume, fulfillment rate, etc.)
- [ ] Date range presets: last 7d, 30d, custom?
- [ ] Is report data real-time or daily aggregated?
