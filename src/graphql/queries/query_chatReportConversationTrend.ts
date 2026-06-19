import gql from 'graphql-tag';

export default gql`
query chatReportConversationTrend (
      $channel_codes: String = "", $from: Float = 1.5, $store_ids: String = "", $to: Float = 1.5, $type: String
    ) {
    chatReportConversationTrend(from: $from, to: $to, channel_codes: $channel_codes, store_ids: $store_ids, type: $type) {
      color
      defaultSelected
      description
      increase
      title
      tooltip
      unit
      value
      data {
        color
        label
        time
        value
      }
    }
  }
`;