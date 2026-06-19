import gql from 'graphql-tag';

export default gql`
query chatReportConversationBar (
    $channel_codes: String = "", $from: Float = 1.5, $store_ids: String = "", $to: Float = 1.5, $type: String
  ) {
    chatReportConversationBar(from: $from, to: $to, channel_codes: $channel_codes, store_ids: $store_ids, type: $type) {
      title
      total
      data {
        color
        label
        time
        value
      }
  }
}
`