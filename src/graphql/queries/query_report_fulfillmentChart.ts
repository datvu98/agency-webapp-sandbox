import gql from 'graphql-tag';

export default gql`
    query report_fulfillmentChart($channel_codes: String, $from: Int!, $fulfillment_provider_type: Int, $sources: String, $store_ids: String, $to: Int!) {
      report_fulfillmentChart(from: $from, to: $to, channel_codes: $channel_codes, fulfillment_provider_type: $fulfillment_provider_type, sources: $sources, store_ids: $store_ids) {
        value
        unit
        tooltip
        increase
        title
        description
        defaultSelected
        data {
          cancel
          label
          return
          time
          value
        }
        color
      }
    }

`;