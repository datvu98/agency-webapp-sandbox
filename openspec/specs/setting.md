# Setting

## Overview
Administration panel for agency configuration — SME management, users, partners, commissions, contracts.

## Capabilities

### User Management
- Sub-user list, create, update info, change password
- Own profile: view/update, change password

### SME Management
- View and manage SME (small/medium enterprise) tenants

### Partner & Integration
- Partner connect — link fulfillment partners
- UpS Connect — integration with UpS service

### Commission & Contracts
- Commission config — define commission structures
- Commission create — new commission entries
- Contract management — view and manage contracts

## Pages
| Page | Path |
|------|------|
| `SubUserList` | `/settings/sub-users` |
| `SubUserCreate` | `/settings/sub-users/create` |
| `SubUserUpdateInfo` | `/settings/sub-users/:id` |
| `SubUserChangePassword` | `/settings/sub-users/:id/password` |
| `UserSetting` | `/settings/profile` |
| `UserUpdate` | `/settings/profile/update` |
| `UserChangePassword` | `/settings/profile/password` |
| `SMEManage` | `/settings/sme` |
| `PartnerConnect` | `/settings/partners` |
| `UpSConnect` | `/settings/ups` |
| `CommissionConfig` | `/settings/commission` |
| `CommissionCreate` | `/settings/commission/create` |
| `ContractManagement` | `/settings/contracts` |

## Access
- Agency users only (admin role may restrict some sub-pages)

## Open Questions
- [ ] Role-based access within settings? (admin vs regular agency user)
- [ ] UpSConnect: what does this integrate with specifically?
