import gql from 'graphql-tag';

export default gql`
    mutation prvPublicRevokeSmeToProvider($provider_connected_id: Int!, $sme_id: Int!) {
      prvPublicRevokeSmeToProvider(provider_connected_id: $provider_connected_id, sme_id: $sme_id) {
        message
        provider_connected_id
        success
      }
}
`