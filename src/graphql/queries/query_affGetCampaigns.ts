import gql from "graphql-tag";

export default gql`
    query affGetCampaigns($filter: CampaignFilterInput) {
  affGetCampaigns(filter: $filter) {
    message
    success
    data {
      limit
      page
      total
      items {
        agencyId
        code
        connectorChannelCode
        createdAt
        endTime
        id
        name
        refCampaignId
        registrationEndTime
        registrationStartTime
        startTime
        status
        updatedAt

        stores {
          agencyId
          approvedProductCount
          bannerDesktopUrl
          bannerMobileUrl
          brandInfo
          campaignId
          campaignName
          creatorIdsJoinedCount
          createdAt
          description
          id
          instruction
          maxCreatorCommissionRate
          maxCreatorShopAdsCommissionRate
          maxTotalCommissionRate
          maxTotalShopAdsCommissionRate
          minCreatorCommissionRate
          minCreatorShopAdsCommissionRate
          minTotalCommissionRate
          minTotalShopAdsCommissionRate
          smeId
          storeCode
          storeId
          storeName
          totalProduct
          updatedAt
          visibleToCreator
          wageAmount
          messageError
        }
      }
    }
  }
}
`