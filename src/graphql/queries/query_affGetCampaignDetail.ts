import gql from "graphql-tag";

export default gql`
  query affGetCampaignDetail($filter: CampaignDetailInput!) {
    affGetCampaignDetail(filter: $filter) {
      message
      success
      data {
        code
        connectorChannelCode
        createdAt
        endTime
        id
        name
        partnerAccountId
        description

        refCampaignId
        registrationEndTime
        registrationStartTime
        startTime
        status
        stores {
          bannerDesktopUrl
          bannerMobileUrl
          brandInfo
          campaignId
          campaignName
          createdAt
          creatorIdsJoinedCount
          description
          hasDemoApproval
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
          messageError
          smeId
          storeCode
          storeId
          storeName
          totalProduct
          updatedAt
          visibleToCreator
          wageAmount

          products {
            campaignId
            createdAt
            creatorCommissionRate
            creatorShopAdsCommissionRate
            hiddenVariantIds
            id
            openCollaborationCommissionRate
            openCollaborationShopAdsRate
            price
            productImageUrl
            productName
            rating
            refProductId
            referralLink
            registerDate
            scProductId
            smeId
            soldCount
            status
            stock
            stockSample
            storeId
            totalCommissionRate
            totalShopAdsCommissionRate
            updatedAt
          }

          conditions {
            id
            campaignId
            campaignStoreId
            storeId
            agencyId
            
            creatorDemoVideoDeadlineDays
            creatorPostDeadlineDays

            categoryId
            joinType

            followers
            gender
            rangeAge

            engagementRate
            avgVideoViews
            avgLiveViews
            avgCommissionRate

            liveSessionCount
            videoCount

            gmv
            sold
            note
          }
        }
        type
        updatedAt
      }
    }
  }
`;
