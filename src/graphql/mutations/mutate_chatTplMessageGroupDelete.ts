import gql from 'graphql-tag';

export default gql`
    mutation chatTplMessageGroupDelete($id: String!) {
        chatTplMessageGroupDelete(id: $id) {
            message
            success
        }
    }
`;
