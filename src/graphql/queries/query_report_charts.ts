import gql from 'graphql-tag';

export default gql`
query report_charts($channel_code: String, $channel_codes: String, $from: Int!, $last_type: String, $source: String, $status: Int, $store_id: Int, $store_ids: String, $to: Int!, $type: String!, $store_status: Int) {
  report_charts(from: $from, to: $to, type: $type, channel_code: $channel_code, channel_codes: $channel_codes, last_type: $last_type, source: $source, store_id: $store_id, store_ids: $store_ids, status: $status, store_status: $store_status) {
    color
    data {
      color
      label
      time
      value
      value2
    }
    defaultSelected
    description
    increase
    title
    tooltip
    unit
    value
    prevData {
      color
      label
      time
      value
      value2
    }
  }
}
`;