import gql from 'graphql-tag';

export default gql`
    mutation vrUpsertConfigCommission($settings: [VrUpsertConfigCommissionInput!], $sme_id: Int!, $contract_id: Int!) {
      vrUpsertConfigCommission(settings: $settings, sme_id: $sme_id, contract_id: $contract_id) {
        message
        success
      }
    }

`