import gql from "graphql-tag";

export default gql`
    query scListConnectorStoreAgency($sme_id: Int, $status: [Int], $store_id: Int) {
        scListConnectorStoreAgency(store_id: $store_id, status: $status, sme_id: $sme_id) {
            agency_id
            created_at
            id
            last_connected_at
            last_contract_expired_at
            last_disconnected_at
            sme_id
            status
            store_id
            updated_at
        }
    }
`;
