import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "types";
import { initialState } from ".";

const selectSlice = (state: RootState) => state.chatSlice || initialState;

export const selectChatSlice = createSelector([selectSlice], (state) => state);
export const selectCurrentPageId = createSelector([selectSlice], (state) => state.currentPage);
export const selectCurrentConverstation = createSelector([selectSlice], (state) => state.currentConversation);
export const selectNeedReloadConversation = createSelector([selectSlice], (state) => state.needReloadConversation);
export const selectConversations = createSelector([selectSlice], (state) => state.conversations);
export const selectMessages = createSelector([selectSlice], (state) => state.messages);
export const selectTotalUnread = createSelector([selectSlice], (state) => state.totalUnread);
