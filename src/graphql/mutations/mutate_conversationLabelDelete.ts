import gql from 'graphql-tag';

export default gql`
    mutation conversationLabelDelete($ids: [Int!]) {
        conversationLabelDelete(ids: $ids) {
            message
            success
        }
    }
`;
