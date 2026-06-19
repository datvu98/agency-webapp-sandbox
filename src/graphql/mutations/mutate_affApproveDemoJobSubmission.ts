import gql from 'graphql-tag';

export default gql`
  mutation affApproveDemoJobSubmission($input: ApproveDemoJobSubmissionInput!) {
    affApproveDemoJobSubmission(input: $input) {
      message
      success
    }
  }
`