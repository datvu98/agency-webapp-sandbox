import gql from "graphql-tag";

export default gql`
    mutation affUpdateCampaignJobOrderInfo($input: UpdateCampaignJobOrderInfoInput!) {
        affUpdateCampaignJobOrderInfo(input: $input) {
            message
            success
        }
    }
`