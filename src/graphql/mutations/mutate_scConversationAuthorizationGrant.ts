import gql from 'graphql-tag';

export default gql`
  mutation scConversationAuthorizationGrant($params: [ConversationAuthorizationParams] = {}, $connector_channel_code: String!) {
    scConversationAuthorizationGrant(connector_channel_code: $connector_channel_code, params: $params) {
      message
      success
    }
  }
`;
