import gql from "graphql-tag";

export default gql`
    query ScStoreForAgency($status: [Int], $per_page: Int!, $search: String, $page: Int!) {
        ScStoreForAgency(page: $page, per_page: $per_page, search: $search, status: $status) {
            total
            stores {
                connector_channel_code
                id
                name
                sme_id
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
