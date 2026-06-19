import gql from 'graphql-tag';

export default gql`
    mutation conversationLabelRemove($conversationId: String!, $ids: [Int!]!) {
        conversationLabelRemove(conversationId: $conversationId, ids: $ids) {
            message
            success
        }
    }
`;
