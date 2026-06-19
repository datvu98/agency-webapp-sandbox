import gql from 'graphql-tag';

export default gql`
    query chatTplMessageGroupDetail($id: String) {
        chatTplMessageGroupDetail(id: $id) {
          data {
            id
            messages
            name
            stores
          }
          message
          success
        } 
    }
`;
