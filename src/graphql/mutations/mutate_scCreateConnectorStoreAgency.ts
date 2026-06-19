import gql from "graphql-tag";

export default gql`
    mutation scCreateConnectorStoreAgency($store_id: ID, $status: Int, $sme_id: ID, $last_contract_expired_at: DateTime) {
        scCreateConnectorStoreAgency(sme_id: $sme_id, status: $status, store_id: $store_id, last_contract_expired_at: $last_contract_expired_at) {
            message
            success
        }
    }
`;
