import { take, call, put, select, takeLatest } from 'redux-saga/effects';
import { chatSliceActions as actions } from '.';
import { Socket } from 'socket.io-client';
import client from 'apollo';
import query_messageList from 'graphql/queries/query_messageList';
import mutation_conversationSendMessage from 'graphql/mutations/mutation_conversationSendMessage';
import mutate_conversationMarkRead from 'graphql/mutations/mutate_conversationMarkRead';
import { selectCurrentConverstation } from './selectors';

function* _selectConversation(action) {
  try {
    const { data } = yield client.query({
      query: query_messageList,
      variables: {
        conversationId: action.payload?.id,
        page: 1,
        pageSize: 20
      },
      fetchPolicy: 'no-cache'
    })
    yield put(actions.fetchMessageComplete(data?.messageList))
  } catch (error) {

  }
}

function* _markReadConversation(action) {
  try {
    const currentConversation = yield select(selectCurrentConverstation)
    if (currentConversation?.id == action?.payload?.id && action?.payload?.unreadCount > 0) {
      yield client.mutate({
        mutation: mutate_conversationMarkRead,
        variables: {
          conversationIds: [currentConversation?.id],
        }
      });
    }
  } catch (error) {

  }
}

export function* chatSliceSaga() {
  yield takeLatest(actions.selectConversation.type, _selectConversation);
  yield takeLatest(actions.markReadConversation.type, _markReadConversation);
}
