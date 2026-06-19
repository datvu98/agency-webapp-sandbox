# Settlement

## Overview
Settlement export and tracking for agency operators — pending and processed states.

## Capabilities
- View pending settlements awaiting processing
- View processed (completed) settlements
- Export settlement data

## Pages
| Page | Path |
|------|------|
| `Settlement` (pending) | `/settlement-manage/pending/*` |
| `Settlement` (processed) | `/settlement-manage/processed/*` |

## Context
`src/app/contexts/` — `SettlementContext` provides shared filter/pagination state.

## Access
- Agency users only

## Open Questions
- [ ] Export format: CSV, Excel, or PDF?
- [ ] Settlement period granularity: daily, weekly, monthly?
