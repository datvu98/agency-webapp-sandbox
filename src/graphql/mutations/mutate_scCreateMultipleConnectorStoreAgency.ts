import gql from "graphql-tag";

export default gql`
    mutation scCreateMultipleConnectorStoreAgency($items: [CreateConnectorStoreAgencyInput!]!) {
        scCreateMultipleConnectorStoreAgency(items: $items) {
            message
            success
            errors {
                agency_id
                index
                message
                sme_id
                store_id
            }
        }
    }
`;
