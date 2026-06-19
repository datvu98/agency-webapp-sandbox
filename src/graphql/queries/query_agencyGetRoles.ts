import gql from "graphql-tag";

export default gql`
query agencyGetRoles($searchText: String = "", $pageSize: Int = 200, $page1: Int = 1) {
  agencyGetRoles(page: $page1, pageSize: $pageSize, searchText: $searchText) {
    message
    success
    items {
      id
      name
      code
      createdAt
      description
      permissions
      updatedAt
    }
  }
}`