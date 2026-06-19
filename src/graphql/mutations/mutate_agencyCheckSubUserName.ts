import gql from "graphql-tag";

export default gql`
mutation agencyCheckSubUserName($name: String!) {
  agencyCheckSubUserName(name: $name) {
    isExists
  }
}
`