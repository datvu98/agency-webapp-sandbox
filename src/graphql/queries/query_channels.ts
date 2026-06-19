import gql from 'graphql-tag';

export default gql`
query op_connector_channels {    
    op_connector_channels (connector_type: 1) {
        code
        id        
        logo_asset_id
        logo_asset_url
        name
    }
  }
`;
