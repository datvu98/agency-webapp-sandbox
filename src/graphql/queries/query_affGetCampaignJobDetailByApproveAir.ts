import gql from 'graphql-tag'

export default gql`
    query affGetCampaignJobDetailByApproveAir($id: Int!) {
        affGetCampaignJobDetail(id: $id) {
            message
            success
            data {
              job {
                postDeadline
                jobProducts {
                  id
                  productName
                }
                jobAssets {
                  index
                  type
                  productMedia {
                    jobMedia {
                      airUrl
                      demoUrl
                      type
                    }
                  }
                }
                jobSubmissions {
                  type
                  createdAt
                  updatedAt
                  id
                  postDeadline
                  assets {
                    id
                    index
                    linkDrive
                    advertisingCode
                    note
                    rejectReason
                    status
                    type
                    productMedia {
                      jobProductId
                      jobSubmissionMedia {
                        fullAirUrl
                        url
                        type
                      }
                    }
                  }
                }
                videoCount
                liveSessionCount
                liveApprovedPostCount
                videoApprovedPostCount
                hasDemoApproval
              }
            }
        }
    }
`