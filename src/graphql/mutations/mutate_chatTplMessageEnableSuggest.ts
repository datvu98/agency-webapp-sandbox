import gql from 'graphql-tag';

export default gql`
    mutation chatTplMessageEnableSuggest($enable: Int!) {
        chatTplMessageEnableSuggest(enable: $enable) {
            message
            success
        }
    }
`;
