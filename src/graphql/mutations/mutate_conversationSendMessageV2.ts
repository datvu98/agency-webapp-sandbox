import gql from 'graphql-tag';

export default gql`
mutation conversationSendMessageV2($conversationId: String!, $message: String!, $medias: [CreateAttachmentMessage!] = {}, $items: [CreateItemMessage!]!) {
  conversationSendMessageV2(conversationId: $conversationId, message: $message, medias: $medias, items: $items) {
    message
    success
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
      senderId
      pushErrorMessage
      pushStatus
      senderType
      sentAt
      smeId
      text
      textPlain
    }
  }
}
`;
