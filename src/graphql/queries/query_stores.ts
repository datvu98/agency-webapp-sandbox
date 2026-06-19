import gql from 'graphql-tag';

export default gql`
query query_stores_channel($sme_id: Int) {
    scAgencyConversationStores(sme_id: $sme_id) {
      message
      success
      data {
        connector_channel_code
        id
        authorization_expired_at
        last_connected_at
        last_disconnected_at
        ref_shop_id
        name
        sme_id
        status
      }
    }
    
    op_connector_channels (connector_type: 2) {
        code
        id        
        logo_asset_id
        logo_asset_url
        name
    }
}

`;
