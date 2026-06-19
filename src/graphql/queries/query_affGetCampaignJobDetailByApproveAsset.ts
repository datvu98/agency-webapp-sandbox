import gql from 'graphql-tag';

export default gql`
  query affGetCampaignJobDetailByApproveAsset($id: Int!) {
    affGetCampaignJobDetail(id: $id) {
      message
      success
      data {
        job {
          videoCount
          videoDeadline
          jobSubmissions {
            id
            status
            videoDeadline
            assets {
              id
              jobId
              index
              type
              note
              productMedia {
                id
                jobProductId
                jobSubmissionMedia {
                  url
                  fullAirUrl
                  type
                }
              }
            }
            updatedAt
          }
          jobProducts {
            id
            productName
          }
        }
      }
    }
  }
`;