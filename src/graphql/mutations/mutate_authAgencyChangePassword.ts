import gql from "graphql-tag";

export default gql`
mutation authAgencyChangePassword($password: String!, $token: String!) {
  authAgencyChangePassword(password: $password, token: $token) {
    message
    success
  }
}
  `