import gql from "graphql-tag";

export default gql`
mutation agencyUserLogin($agencyUserLoginInput: AgencyUserLoginInput!) {
  agencyUserLogin(agencyUserLoginInput: $agencyUserLoginInput) {
    accessToken
    message
    refreshToken
    success
  }
}
  `