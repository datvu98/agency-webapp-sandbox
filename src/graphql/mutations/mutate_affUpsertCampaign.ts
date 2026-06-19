import gql from "graphql-tag";

export default gql`
    mutation affUpsertCampaign($input: UpsertCampaignInput!) {
        affUpsertCampaign(input: $input) {
            message
            success
        }
    }
`