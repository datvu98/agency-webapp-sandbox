import gql from 'graphql-tag';

export default gql`
    mutation conversationLabelUpdate($title: String!, $color: String!, $id: Int!) {
        conversationLabelUpdate(title: $title, color: $color, id: $id) {
            message
            success
        }
    }
`;
