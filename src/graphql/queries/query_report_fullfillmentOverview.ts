import gql from 'graphql-tag';

export default gql`
    query report_fullfillmentOverview($from: Int!, $to: Int!, $channel_codes: String, $fulfillment_provider_type: Int, $sources: String, $store_ids: String) {
      report_fullfillmentOverview(from: $from, to: $to, channel_codes: $channel_codes, fulfillment_provider_type: $fulfillment_provider_type, sources: $sources, store_ids: $store_ids) {
        totalCancel
        totalProcessed
        totalProcessedFail
        totalProcessedSuccess
        totalProcessedShipped
        totalCancelBySla
      }
}
`;