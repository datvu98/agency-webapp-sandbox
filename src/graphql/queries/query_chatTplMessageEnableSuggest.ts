import gql from 'graphql-tag';

export default gql`
    query chatTplMessageEnableSuggest ($smeId: Int!) {
      chatTplMessageEnableSuggest (smeId: $smeId)
    }
`;