import gql from "graphql-tag";

export default gql`
mutation agencyUpdateSubUserV2($userUpdateSubUserInput: UserUpdateSubUserInputInput!) {
  agencyUpdateSubUserV2(userUpdateSubUserInput: $userUpdateSubUserInput) {
    message
    success
  }
}
`