import gql from "graphql-tag";

export default gql`
mutation agencyCreateTempAccessToken($smeId: Int!) {
  agencyCreateTempAccessToken(smeId: $smeId) {
    data
    messge
    success
  }
}

  `