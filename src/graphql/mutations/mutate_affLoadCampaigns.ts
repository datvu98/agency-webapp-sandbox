import gql from "graphql-tag";

export default gql`
    mutation affLoadCampaigns($connectorChannelCode: String!, $partnerAccountId: Int!) {
        affLoadCampaigns(connectorChannelCode: $connectorChannelCode, partnerAccountId: $partnerAccountId) {
            message
            success
            data {
                tracking_id
            }
        }
    }
`