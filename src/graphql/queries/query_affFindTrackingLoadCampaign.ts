import gql from "graphql-tag";

export default gql`
    query affFindTrackingLoadCampaign($filter: FindTrackingLoadCampaignInput!) {
        affFindTrackingLoadCampaign(filter: $filter) {
            message
            success
            data {
              agencyId
              connectorChannelCode
              id
              listErrorMessage {
                message
                ref_id
                campaign_name
              }
              partnerAccountId
              total
              totalFail
              totalProcessed
              totalSuccess
            }
        }
    }
`