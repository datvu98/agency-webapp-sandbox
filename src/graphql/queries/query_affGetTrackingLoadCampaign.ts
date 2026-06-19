import gql from "graphql-tag";

export default gql`
    query affGetTrackingLoadCampaign($filter: GetTrackingLoadCampaignInput!) {
        affGetTrackingLoadCampaign(filter: $filter) {
            message
            success
            data {
              total
              affTrackingLoadCampaign{
                agencyId 
                connectorChannelCode
                id
                listErrorMessage {
                  message
                  campaign_name
                  ref_id
                }
                partnerAccountId
                total
                totalFail
                totalProcessed
                totalSuccess
              }
            }
        }
    }
`