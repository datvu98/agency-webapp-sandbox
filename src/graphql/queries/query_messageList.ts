import gql from 'graphql-tag';

export default gql`
  query messageList($conversationId: String!, $page: Int, $pageSize: Int) {
    messageList(conversationId: $conversationId, page: $page, pageSize: $pageSize) {
      message
      success
      page
      pageSize
      totalPages
      items {
        attachments {
          createdAt
          fileId
          id
          messageId
          smeId
          type
          value
        }
        channelCode
        channelRefId
        conversationId
        createdAt
        id
        pushErrorMessage
        pushStatus
        senderId
        senderType
        sentAt
        smeId
        text
        textPlain
      }
    }
  }
`;
