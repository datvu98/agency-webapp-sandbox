import gql from 'graphql-tag'

export default gql`
  query affGetJobProductsApprovedVideoMedia($jobId: Int!, $statusAsset: String) {
    affGetJobProductsApprovedVideoMedia(jobId: $jobId, statusAsset: $statusAsset) {
      message
      success
      data {
        items {
          approvedVideoCount
          jobProductId
          campaignProductId
          creatorChannelId
          medias {
            advertisingCode
            airUrl
            fullAirUrl
            createdAt
            demoUrl
            id
            type
          }
          productImage
          productName
          requiredVideoCount
          scProductId
          totalVideoCount
          variants {
            id
            quantityPurchased
            scVariantId
            variantImage
            variantName
            variantSku
          }
        }
      }
    }
  }
`