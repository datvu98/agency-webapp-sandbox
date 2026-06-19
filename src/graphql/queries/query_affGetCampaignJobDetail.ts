import gql from "graphql-tag";

export default gql`
  query affGetCampaignJobDetail($id: Int!) {
    affGetCampaignJobDetail(id: $id) {
      message
      success
      data {
        job {
          campaignId
          campaignSampleRequest {
            id
            items {
              id
              productName
              quantityPurchased
              variantImage
              variantName
              variantSku
              status
            }
            status
            rejectMessage
            orderId
            smeId
            phone
            recipientName
            fullAddress
          }
          campaignStore {
            smeId
            bannerDesktopUrl
            bannerMobileUrl
            campaignName
            connectorChannelCode
            storeName
            registrationStartTime
          }
          campaignStoreId
          cancelAt
          cancelBy
          cancelReason
          connectorChannelCode
          creatorChannelId
          creatorChannelName
          creatorChannelUsername
          creatorId
          id
          jobProducts {
            id
            liveSessionCount
            productImage
            status
            videoCount
          }
          jobSubmissions {
            id
            type
            status
          }
          hasDemoApproval
          isPreShippingCancel
          liveSessionCount
          refShopId
          status
          storeId
          videoCount
          createdAt
          postDeadline
          postDemoDeadline
          videoAirDeadline
          videoDeadline
        }
      }
    }
  }
`