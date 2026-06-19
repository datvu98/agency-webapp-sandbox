import gql from 'graphql-tag';

export default gql`
    query chatTplMessageGroups($page: Int, $pageSize: Int, $storeId: Int) {
        chatTplMessageGroups(page: $page, pageSize: $pageSize, storeId: $storeId) {
          items {
            id
            messages
            name
            stores
          }
          message
          page
          pageSize
          success
          totalPages
        } 
    }
`;
