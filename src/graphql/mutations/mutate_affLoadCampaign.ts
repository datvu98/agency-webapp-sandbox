import gql from "graphql-tag";

export default gql`
    mutation affLoadCampaign($partnerAccountId: Int!, $channelCode: String!, $refCampaignId: String!) {
        affLoadCampaign(partnerAccountId: $partnerAccountId, channelCode: $channelCode, refCampaignId: $refCampaignId) {
            message
            success
        }
    }
`