import gql from 'graphql-tag';

export default gql`
  mutation scPartnerAuthorizationGrant($connector_channel_code: String!, $params: [SaleAuthorizationParams]!) {
    scPartnerAuthorizationGrant(connector_channel_code: $connector_channel_code, params: $params) {
      message
      success
      store_id
    }
  }
`;