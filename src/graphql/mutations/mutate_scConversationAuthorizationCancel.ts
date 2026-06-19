import gql from 'graphql-tag';

export default gql`
  mutation scConversationAuthorizationCancel($conversation_store_id: Int!) {
    scConversationAuthorizationCancel(conversation_store_id: $conversation_store_id) {
      conversation_store_id
      message
      success
    }
  }
`;
