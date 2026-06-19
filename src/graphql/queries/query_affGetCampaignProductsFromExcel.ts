import gql from "graphql-tag";

export const GET_CAMPAIGN_PRODUCTS_EXCEL = gql`
  query AffGetCampaignProductsFromExcel(
    $excelUrl: String!
    $campaignStoreId: Int
    $campaignId: Int
  ) {
    affGetCampaignProductsFromExcel(
      excelUrl: $excelUrl
      campaignStoreId: $campaignStoreId
      campaignId: $campaignId
    ) {
      success
      message
      data {
        passedItems {
          rowNumber
          productName
          refProductId
          campaignProductId
          creatorCommissionRate
          totalCommissionRate
          creatorShopAdsCommissionRate
          affiliateShopAdsCommissionRate
          totalShopAdsCommissionRate
          referralLink
          isValid
          errors
        }
        errorItems {
          rowNumber
          productName
          refProductId
          campaignProductId
          creatorCommissionRate
          totalCommissionRate
          creatorShopAdsCommissionRate
          affiliateShopAdsCommissionRate
          totalShopAdsCommissionRate
          referralLink
          isValid
          errors
        }
      }
    }
  }
`;
