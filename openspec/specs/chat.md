# Chat

## Overview
Real-time customer chat for agency operators using Socket.io.

## Capabilities
- Agency operators chat with customers in real-time
- Socket connection scoped to `<SocketProvider>` context wrapping `ChatPage`
- Apollo WebSocket subscriptions used for message delivery via `REACT_APP_CHATTING_SOCKET_URL`

## Pages
| Page | Path |
|------|------|
| `ChatPage` | `/chats` |

## Context
`src/app/contexts/` — `SocketProvider` manages Socket.io lifecycle (connect/disconnect on mount/unmount, event listeners).

## Access
- Agency users only (`user.category_code !== 'fulfillment'`)
- Fulfillment users do not see chat routes in `MainLayout`

## Open Questions
- [ ] Message persistence: are messages stored in backend or socket-only?
- [ ] Unread badge: is there a global unread count in the Redux store?
- [ ] Reconnect strategy on socket drop?
