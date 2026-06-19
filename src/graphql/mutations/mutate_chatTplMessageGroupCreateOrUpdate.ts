import gql from 'graphql-tag';

export default gql`
    mutation chatTplMessageGroupCreateOrUpdate($messages: [String!]!, $name: String!, $stores: [Int!]!, $id: String) {
        chatTplMessageGroupCreateOrUpdate(messages: $messages, name: $name, stores: $stores, id: $id) {
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
