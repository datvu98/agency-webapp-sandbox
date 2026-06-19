import gql from 'graphql-tag';

export default gql`
    mutation affRejectCampaignSampleRequest($ids: [Int!]!, $reject_message: String!) {
        affRejectCampaignSampleRequest(ids: $ids, reject_message: $reject_message) {
            success
            message
        }
    }
`