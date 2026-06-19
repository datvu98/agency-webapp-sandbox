import gql from "graphql-tag";

export default gql`
mutation agencyDeleteSubUser($id: Int!) {
  agencyDeleteSubUser(id: $id) {
    message
    success
  }
}
`