import gql from 'graphql-tag';

export default gql`
    mutation conversationLabelCreate($title: String!, $color: String!, $smeId: Int!) {
        conversationLabelCreate(title: $title, color: $color, smeId: $smeId) {
            message
            success
        }
    }
`;
