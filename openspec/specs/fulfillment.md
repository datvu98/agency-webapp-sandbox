# Fulfillment

## Overview
Fulfillment operation management and reporting for agency operators.

## Capabilities
- View and manage fulfillment orders (Operation tab)
- Fulfillment reports and metrics (Report tab)

## Pages
| Page | Path |
|------|------|
| `Fullfillment` (Operation) | `/fullfillment-manage/operation/*` |
| `Fullfillment` (Report) | `/fullfillment-manage/report/*` |

## Structure
```
Fullfillment/
├── Operation/           ← order operation views
├── FullfillmentReport/  ← analytics
├── FullfillmentConstants.ts
└── components/
```

## Context
`src/app/contexts/` — `FulfillmentContext` provides shared state across fulfillment sub-pages.

## Access
- Agency users only; fulfillment provider users are routed to `WarehouseManagement` instead

## Open Questions
- [ ] What fulfillment statuses are tracked? (pending, picked, packed, shipped?)
- [ ] Does the report use Apollo subscriptions or polling?
