import gql from "graphql-tag";

export default gql`
mutation authAgencyForgotPassword($email: String!) {
  authAgencyForgotPassword(email: $email) {
    message
    success
  }
}
  `