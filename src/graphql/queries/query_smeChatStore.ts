import gql from 'graphql-tag';

export default gql`
  query smeChatStores {
    scAgencyConversationStores {
      message
      success
      data {
        connector_channel_code
        id
        name
        sme_id
        status
      }
    }
    op_connector_channels {
      id
      logo_asset_url
      code
    }
}


`;
