import gql from "graphql-tag";

export default gql`
    mutation vrUpsertConfigCommissionFulfillment($settings: [VrFormulaRuleFulfillmentInput!], $sme_id: Int!, $contract_id: Int!) {
        vrUpsertConfigCommissionFulfillment(sme_id: $sme_id, settings: $settings, contract_id: $contract_id) {
            message
            success
        }
    }
`;
