import gql from 'graphql-tag';

export default gql`
    query scPartnerAuthorizationUrl($connector_channel_code: String!) {
        scPartnerAuthorizationUrl(connector_channel_code: $connector_channel_code) {
            authorization_url
        }
    }
`;