import gql from 'graphql-tag';

export default gql`
    mutation conversationLabelAdd($conversationIds: [String!]!, $ids: [Int!]!) {
        conversationLabelAdd(conversationIds: $conversationIds, ids: $ids) {
            data {
                errors {
                    id
                    message
                }
                total
                totalError
                totalSuccess
            }
            message
            success
        }
    }
`;
