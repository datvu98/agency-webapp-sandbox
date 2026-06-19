import gql from 'graphql-tag';

export default gql`
    query chatReportOverviewIndex($channel_codes: String = "", $from: Float = 1.5, $store_ids: String = "", $to: Float = 1.5, $type: String) {
        chatReportOverviewIndex(from: $from, to: $to, channel_codes: $channel_codes, store_ids: $store_ids, type: $type) {
          avgDuration
          countChat
          countOnTimeResponses
          countExpiredChat
          countExpiredResponses
          countResponses
          rateResponses
        } 
    }
`;
