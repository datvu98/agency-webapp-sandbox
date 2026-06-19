import { PayloadAction, current } from "@reduxjs/toolkit";
import { createSlice } from "utils/@reduxjs/toolkit";
import { useInjectReducer, useInjectSaga } from "utils/redux-injectors";
import { chatSliceSaga } from "./saga";
import { ChatSliceState } from "./types";
import { parseMesssage } from "utils/messages";
import moment from "moment";
import { findIndex } from "lodash";
import { changePositionConversation } from "utils/helper";

export const initialState: ChatSliceState = {
  needReloadConversation: {},
  totalUnread: 0
};

const user = !!localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '') : {}

const slice = createSlice({
  name: "chatSlice",
  initialState,
  reducers: {
    saveTotalUnread(state, action: PayloadAction<any>) {
      return {
        ...state,
        totalUnread: action.payload || 0
      }
    },
    selectPage(state, action: PayloadAction<any>) {
      let currentConversation = action.payload != state.currentPage ? undefined : state.currentConversation
      return {
        ...state,
        currentPage: action.payload,
        currentConversation
      }
    },
    selectConversation(state, action: PayloadAction<any>) {
      let messages = action.payload != state.currentConversation ? [] : state.messages
      let loadingMessage = action.payload != state.currentConversation ? true : state.loadingMessage
      return {
        ...state,
        currentConversation: action.payload,
        messages,
        loadingMessage
      }
    },
    updateCurrentConversation(state, action: PayloadAction<any>) {
      if (state?.currentConversation?.id != action.payload.id) return state;

      return {
        ...state,
        currentConversation: {
          ...state.currentConversation,
          ...action.payload
        },
      }
    },
    reloadConversation(state, action: PayloadAction<any>) {
      return {
        ...state,
        needReloadConversation: {
          ...(state.needReloadConversation || {}),
          [action.payload]: Date.now()
        }
      }
    },
    fetchMessageComplete(state, action: PayloadAction<any>) {
      const stateChat = { ...state }
      const messagesParse = parseMesssage(action.payload?.items, { ...stateChat.currentConversation });

      return {
        ...state,
        messages: messagesParse,
        loadingMessage: false
      }
    },
    initConversations(state, action: PayloadAction<any>) {
      return {
        ...state,
        conversations: action.payload
      }
    },
    appendConversation(state, action: PayloadAction<any>) {
      return {
        ...state,
        conversations: [action.payload].concat(state.conversations)
      }
    },
    appendMoreConversation(state, action: PayloadAction<any>) {
      const conversationPassed = action.payload.filter(conversation => {
        return !state.conversations.some(item => item?.id == conversation?.id);
      })

      return {
        ...state,
        conversations: state.conversations.concat(conversationPassed)
      }
    },
    updateConversation(state, action: PayloadAction<any>) {
      const conversations = [...state.conversations];
      const isSort = action.payload.isSort;

      const mappedConversations = conversations?.map(conversation => {
        if (conversation?.id == action?.payload?.id) {
          return {
            ...conversation,
            ...action.payload,
            ...(state?.currentConversation?.id == action?.payload?.id ? {
              unreadCount: 0,
              isRead: 1,
            } : {})
          }
        }
        return conversation
      });

      const indexConversationNeedSort = findIndex(
        mappedConversations,
        conversation => conversation?.id == action.payload?.id
      );

      let sortedConversation = [...mappedConversations];
      if (isSort) {
        sortedConversation = changePositionConversation(
          [...mappedConversations],
          indexConversationNeedSort,
          0
        );

        if (state.currentConversation?.id == action.payload?.id) {
          !!action.payload?.cb && action.payload?.cb();
        }
      }

      return {
        ...state,
        conversations: sortedConversation
      }
    },
    appendMoreMessage(state, action: PayloadAction<any>) {
      const stateChat = { ...state }
      const newMessages = parseMesssage(action.payload, { ...stateChat.currentConversation });

      return {
        ...state,
        messages: newMessages.concat(state.messages)
      }
    },
    appendMessage(state, action: PayloadAction<any>) {
      const stateChat = { ...state };
      if (stateChat.loadingMessage || { ...stateChat?.currentConversation }?.id != action.payload[0]?.conversationId) {
        return stateChat;
      };

      let newParseMess = parseMesssage(action.payload, { ...stateChat.currentConversation }, true);
      // Add avatar when new position
      newParseMess = newParseMess.map((mess, index) => {
        if (index == 0) {
          const lastPositionOldMess = state.messages?.[state?.messages?.length - 1]?.position;
          if (lastPositionOldMess != mess?.position) {
            return {
              ...mess,
              ...(mess?.position == 'left' ? {
                customer: state?.currentConversation?.customer
              } : {
                user: user
              })
            }
          }
        }

        return mess
      })


      // Add system date when sentAt first message difference last old message
      const [lastSentAt, newSentAt] = [
        +state.messages?.[state?.messages?.length - 1]?.sentAt,
        newParseMess?.[0]?.sentAt
      ];
      const lastMessSentAt = moment.unix(lastSentAt / 1000).format('DD/MM/YYYY');
      const newMessSentAt = moment.unix(newSentAt / 1000).format('DD/MM/YYYY');

      if (!!lastSentAt && !!newMessSentAt && lastMessSentAt != newMessSentAt) {
        newParseMess = [
          { type: 'system', text: 'Hôm nay' },
          ...newParseMess
        ]
      }

      return {
        ...state,
        messages: state.messages.concat(newParseMess)
      }
    },
    updateMessage(state, action: PayloadAction<any>) {
      if (state?.currentConversation?.id != action.payload[0]?.conversationId) {
        return state;
      };

      const newParseMess = parseMesssage(action.payload, state.currentConversation, true);
      const newMessages = state.messages.map(mess => {
        if (mess?.messId == action.payload[0]?.id) {
          return {
            ...mess,
            ...newParseMess[0]
          }
        }
        return mess
      })

      return {
        ...state,
        messages: newMessages
      }
    },

    markReadConversation(state, action: PayloadAction<any>) {
      return state
    },
    clearConversation() {
      return initialState
    }

  },
});

export const { actions: chatSliceActions } = slice;

export const useChatSliceSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: chatSliceSaga });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useChatSliceSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
