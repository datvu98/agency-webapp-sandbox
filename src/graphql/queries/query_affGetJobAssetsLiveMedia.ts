import gql from "graphql-tag";

export default gql`
    query affGetJobAssetsLiveMedia($jobId: Int!, $statusAsset: String) {
        affGetJobAssetsLiveMedia(jobId: $jobId, statusAsset: $statusAsset) {
            data {
                items {
                    approvedDemoAt
                    advertisingCode
                    approvedAirAt
                    id
                    index
                    linkDrive
                    note
                    medias {
                      airUrl
                      demoUrl
                      id
                      type
                    }
                    products {
                      jobProductId
                      productName
                      productImage
                      requiredLiveSessionCount
                      variants {
                          variantName
                          quantityPurchased
                      }
                    }
                    status
                    type
                }
            }
            message
            success
        }
    }
`;