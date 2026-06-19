import { Socket } from "socket.io-client";

/* --- STATE --- */
export interface ChatSliceState {
  currentPage?: string,
  currentConversation?: any,
  conversations?: any,
  needReloadConversation?: any,
  messages?: any,
  loadingMessage?: boolean,
  totalUnread?: number
}
