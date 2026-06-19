import gql from 'graphql-tag'

export default gql`
  query affGetPreviousSubmissionAssets($input: JobSubmissionAssetListInput!) {
    affGetPreviousSubmissionAssets(input: $input) {
      message
      success
      data {
        items {
          createdAt
          updatedAt
          index
          note
          type
          rejectReason
          status
          productMedia {
            jobProductId
            jobSubmissionMedia {
              url
              type
            }
          }
          rejectedAt
          approvedAt
        }
      }
    }
  }
`