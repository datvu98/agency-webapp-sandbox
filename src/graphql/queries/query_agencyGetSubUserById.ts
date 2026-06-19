import gql from "graphql-tag";

export default gql`
query agencyGetSubUserById($id: Int!) {
  agencyGetSubUserById(id: $id) {
    message
    success
    data {
      id
      name
      stores
      updatedAt
      username
      warehouses
      createdAt
      smes
      chatStores
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
    }
  }
}
`