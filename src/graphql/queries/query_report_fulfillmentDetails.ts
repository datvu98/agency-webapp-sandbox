import gql from 'graphql-tag';

export default gql`
query report_fulfillmentDetails($from: Int!, $to: Int!, $channel_codes: String, $fulfillment_provider_type: Int, $page: Int, $pageSize: Int, $sources: String, $store_ids: String) {
  report_fulfillmentDetails(from: $from, to: $to, channel_codes: $channel_codes, fulfillment_provider_type: $fulfillment_provider_type, page: $page, pageSize: $pageSize, sources: $sources, store_ids: $store_ids) {
    totalProcessedSuccess
    totalProcessedShipped
    totalProcessedFail
    totalProcessed
    totalPage
    totalCancelBySla
    totalCancel
    pageSize
    page
    items {
      smeId
      storeId
      totalCancel
      totalProcessed
      totalProcessedFail
      totalProcessedSuccess
      totalProcessedShipped
      totalCancelBySla
    }
  }
}


`