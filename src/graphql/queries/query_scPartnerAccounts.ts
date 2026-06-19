import gql from 'graphql-tag';

export default gql`
  query scPartnerAccounts {
    scPartnerAccounts {
      active_authorization_id
      agency_id
      authorization_expired_at
      category_asset_cipher
      connector_channel_code
      country_code
      created_at
      id
      last_connected_at
      last_disconnected_at
      name
      ref_partner_id
      status
      updated_at
    }
  }
`;