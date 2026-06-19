import gql from 'graphql-tag';

export default gql`
query conversationList($channelCode: String, $filterReplyExpired: [Int], $page: Int, $pageSize: Int, $sort: Int, $filterStatus: [Int], $filterConversationStores: [Int], $filterLabels: [Int], $textSearch: String) {
    conversationList(channelCode: $channelCode, filterReplyExpired: $filterReplyExpired, page: $page, pageSize: $pageSize, sort: $sort, filterStatus: $filterStatus, filterConversationStores: $filterConversationStores, filterLabels: $filterLabels, textSearch: $textSearch) {
      message
      success
      page
      pageSize
      items {
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
        conversationStoreId
        lastMessage
        lastMessageSender
        lastMessageType
        lastUpdated
        replyExpiredAt
        smeId
        unreadCount
      }
    }
  }
`;
