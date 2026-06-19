import gql from 'graphql-tag';

export default gql`
  mutation affApproveAirJobSubmission($input: ApproveAirJobSubmissionInput!) {
    affApproveAirJobSubmission(input: $input) {
      message
      success
    }
  }
`