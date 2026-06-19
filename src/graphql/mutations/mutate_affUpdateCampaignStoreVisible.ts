import gql from "graphql-tag";

export default gql`
    mutation affUpdateCampaignStoreVisible($input: UpdateCampaignStoreVisibleInput!) {
        affUpdateCampaignStoreVisible(input: $input) {
            message
            success
            data
        }
    }
`