import gql from 'graphql-tag';

export default gql`
  mutation affApproveCampaignSampleRequest($id: Int!, $request_item_ids: [Int!]!, $should_check_stock: Int) {
    affApproveCampaignSampleRequest(
      id: $id,
      request_item_ids: $request_item_ids,
      should_check_stock: $should_check_stock
    ) {
      success
      message
      error_code
    }
  }
`