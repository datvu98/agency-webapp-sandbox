import gql from "graphql-tag";

export default gql`
  query affGetPreviousSubmissions($jobId: Int!, $type: String) {
    affGetPreviousSubmissions(jobId: $jobId, type: $type) {
      message
      success
      data {
        approvedLiveAirCount
        approvedVideoAirCount
        approvedDemoCount
        videoCount
        liveCount
        items {
          assets {
            productMedia {
              jobSubmissionMedia {
                url
                type
              }
              jobProductId
            }
            rejectReason
            status
            updatedAt
            note
            index
            submissionMedias {
              type
              url
              
            }
          }
          videoDeadline
          status
          createdAt
          approvedAt
          postDeadline
        }
      }
    }
  }
`