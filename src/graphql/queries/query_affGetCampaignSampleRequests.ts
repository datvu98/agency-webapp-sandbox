import gql from 'graphql-tag';

export default gql`
    query affGetCampaignSampleRequests($filter: CampaignSampleRequestListFilterInput) {
        affGetCampaignSampleRequests(filter: $filter) {
            message
            success
            data {
                limit
                page
                total
                items {
                  campaignId
                  connectorChannelCode
                  createdAt
                  creatorId
                  creatorChannelId
                  creatorChannelName
                  creatorRefId
                  creatorChannelUsername
                  district
                  districtCode
                  fullAddress
                  id
                  isReceiveSample
                  items {
                    campaignId
                    campaignProductId
                    campaignSampleRequestId
                    createdAt
                    creatorCommissionRate
                    id
                    productName
                    quantityPurchased
                    scProductId
                    scVariantId
                    status
                    storeId
                    updatedAt
                    variantImage
                    variantName
                    variantSku
                  }
                  orderId
                  phone
                  province
                  provinceCode
                  rejectMessage
                  requestType
                  smeId
                  status
                  storeId
                  ward
                  wardCode
                }
            }
        }
    }
`