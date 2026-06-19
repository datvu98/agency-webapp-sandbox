import gql from 'graphql-tag';

export default gql`
  query scConversationAuthorizationUrl($connector_channel_code: String!) {
    scConversationAuthorizationUrl(connector_channel_code: $connector_channel_code) {
      authorization_url
    }
  }
`;
