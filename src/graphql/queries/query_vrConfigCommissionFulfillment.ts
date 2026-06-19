import gql from "graphql-tag";

export default gql`
    query vrConfigCommissionFulfillment($sme_id: Int!, $contract_id: Int!) {
        vrConfigCommissionFulfillment(sme_id: $sme_id, contract_id: $contract_id) {
            settings {
                commission_per_order
                formula_result
                stores
            }
            last_executed_at
            last_updated_at
            message
            success
        }
    }
`;
