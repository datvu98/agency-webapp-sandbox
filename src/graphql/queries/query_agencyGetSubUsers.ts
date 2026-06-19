import gql from "graphql-tag";

export default gql`
query agencyGetSubUsers($page: Int , $pageSize: Int , $searchText: String , $searchType: Int) {
  agencyGetSubUsers(searchText: $searchText, pageSize: $pageSize, page: $page, searchType: $searchType) {
    items {
      chatStores
      stores
      id
      name
      createdAt
      smes
      roles
      roleItems {
        code
        createdAt
        description
        id
        name
        permissions
        updatedAt
      }
      updatedAt
      username
      warehouses
    }
    pagination {
      page
      pageSize
      total
      totalPage
    }
    success
    message
  }
}`