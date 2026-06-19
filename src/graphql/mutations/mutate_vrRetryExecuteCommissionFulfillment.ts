import gql from "graphql-tag";

export default gql`
    mutation vrRetryExecuteCommissionFulfillment($from_time: Int!, $sme_id: Int!, $to_time: Int!, $contract_id: Int!) {
        vrRetryExecuteCommissionFulfillment(from_time: $from_time, sme_id: $sme_id, to_time: $to_time, contract_id: $contract_id) {
            message
            success
        }
    }
`;
