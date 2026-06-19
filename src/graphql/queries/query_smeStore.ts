import gql from 'graphql-tag';

export default gql`
  query smeStores {
    scAgencySaleStores {
      message
      success
      data {
        id
        name
        email
        sme_id
        connector_channel_code
        status
      }
    }

    op_connector_channels {
      id
      logo_asset_url
      code
      name
    }
}


`;
