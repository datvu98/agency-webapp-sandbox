import gql from 'graphql-tag';

export default gql`
  query chatTplMessageSuggest($text: String!, $storeId: Int, $smeId: Int!) {
    chatTplMessageSuggest(text: $text, storeId: $storeId, smeId: $smeId)
  }
`;