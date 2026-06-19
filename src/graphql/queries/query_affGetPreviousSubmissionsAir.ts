import gql from 'graphql-tag'

export default gql`
  query affGetPreviousSubmissionsAir($jobId: Int!, $type: String) {
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
        createdAt
        approvedAt
        postDeadline
        status
        videoDeadline
        assets {
          advertisingCode
          index
          linkDrive
          rejectReason
          rejectedAt
          status
          type
          submissionMedias {
            type
            url
            fullAirUrl
          }
          productMedia {
            jobProductId
          }
        }
      }
    }
  }
  }
`