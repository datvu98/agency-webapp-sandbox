import gql from 'graphql-tag';

export default gql`
    mutation agencySubUserLogin($agencySubUserLoginInput: AgencySubUserLoginInput!) {
    agencySubUserLogin(agencySubUserLoginInput: $agencySubUserLoginInput) {
      accessToken
      message
      refreshToken
      success
    }
}
`