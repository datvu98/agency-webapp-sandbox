import gql from 'graphql-tag';

export default gql`
    mutation vrRetryExecuteCommission($sme_id: Int!, $from_time: Int!, $to_time: Int!, $contract_id: Int!) {
        vrRetryExecuteCommission(from_time: $from_time, sme_id: $sme_id, to_time: $to_time, contract_id: $contract_id) {
            message
            success
        }
    }

`