import gql from "graphql-tag";

export default gql`
    query affCountCampaignEligible($partnerAccountId: Int!) {
        affCountCampaignEligible(partnerAccountId: $partnerAccountId) {
            message
            success
            data {
              total
            }
        }
    }
  `;