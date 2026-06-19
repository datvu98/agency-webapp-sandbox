import gql from 'graphql-tag';

export default gql`
    query chatReportOverviewRateOnTimeReponses($channel_codes: String = "", $from: Float = 1.5, $store_ids: String = "", $to: Float = 1.5, $type: String) {
      chatReportOverviewRateOnTimeReponses(from: $from, to: $to, channel_codes: $channel_codes, store_ids: $store_ids, type: $type)
    }
`;