import gql from "graphql-tag";

export const GET_CAMPAIGN_JOBS = gql`
  query affGetCampaignJobs($filter: CampaignJobListFilterInput) {
    affGetCampaignJobs(filter: $filter) {
      success
      message
      data {
        items {
          approvedAt
          campaignId
          campaignStoreId
          cancelReason
          connectorChannelCode
          createdAt
          creatorChannelId
          creatorChannelName
          creatorChannelUsername
          creatorId
          creatorRefId
          hasDemoApproval
          id
          isPreShippingCancel
          liveSessionCount
          postDeadline
          postDemoDeadline
          refShopId
          status
          storeId
          updatedAt
          videoAirDeadline
          videoCount
          videoDeadline
          cancelAt
          cancelBy
          demoSubmittedAt
          liveApprovedPostCount
          postSubmittedAt
          videoApprovedDemoCount
          videoApprovedPostCount
          campaignSampleRequest {
            approvedAt
            birthday
            campaignId
            campaignJobId
            connectorChannelCode
            createdAt
            creatorChannelId
            creatorChannelName
            creatorChannelUsername
            creatorId
            creatorRefId
            district
            districtCode
            email
            fullAddress
            id
            isReceiveSample
            orderId
            phone
            province
            provinceCode
            rejectMessage
            requestType
            sex
            smeId
            status
            storeId
            updatedAt
            ward
            wardCode
            items {
              id
              campaignSampleRequestId
              campaignId
              productName
              variantName
              variantSku
              variantImage
              scProductId
              scVariantId
              quantityPurchased
              creatorCommissionRate
              status
              storeId
              createdAt
              updatedAt
              approvedAt
            }
          }
        }
        total
        page
        limit
      }
    }
  }
`;
