import gql from 'graphql-tag';

export default gql`
mutation conversationSendMessage($conversationId: String!, $message: String!, $medias: [CreateAttachmentMessage!] = {}, $items: [CreateItemMessage!]!) {
  conversationSendMessage (conversationId: $conversationId, message: $message, medias: $medias, items: $items) {
    message
    success
    data {
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
      senderType
      sentAt
      smeId
      text
      textPlain
    }
  }
}
`;
