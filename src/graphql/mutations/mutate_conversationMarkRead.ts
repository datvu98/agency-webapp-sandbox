import gql from 'graphql-tag';

export default gql`
    mutation conversationMarkRead($conversationIds: [String!]!) {
        conversationMarkRead(conversationIds: $conversationIds) {
            message
            success
        }
    }
`;
