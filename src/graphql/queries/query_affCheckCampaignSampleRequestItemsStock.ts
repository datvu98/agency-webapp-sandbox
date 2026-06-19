import gql from 'graphql-tag';

export default gql`
    query affCheckCampaignSampleRequestItemsStock($ids: [Int!]!) {
        affCheckCampaignSampleRequestItemsStock(ids: $ids) {
          success
          message
          data {
            isEnough
            errorCampaignProductIds
            errorItemIds
          }
        }
    }
`