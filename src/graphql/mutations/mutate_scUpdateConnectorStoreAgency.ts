import gql from "graphql-tag";

export default gql`
    mutation scUpdateConnectorStoreAgency($id: Int!, $last_contract_expired_at: DateTime, $status: Int) {
        scUpdateConnectorStoreAgency(id: $id, last_contract_expired_at: $last_contract_expired_at, status: $status) {
            message
            success
        }
    }
`;
