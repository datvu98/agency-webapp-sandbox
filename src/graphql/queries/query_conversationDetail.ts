import gql from 'graphql-tag';

export default gql`
query conversationDetail($id: String!) {
    conversationDetail(id: $id) {
      message
      success      
      data {
        channelCode
        channelRefId
        created_at
        customer {
          id
          logo
          name
          ref_id
        }
        id
        isRead
        isReplied
        labels {
          color
          id
          title
        }
        storeId
        lastMessage
        lastMessageSender
        conversationStoreId
        lastMessageType
        lastUpdated
        replyExpiredAt
        smeId
        unreadCount
      }
    }
  }
`;
