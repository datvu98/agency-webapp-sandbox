import gql from 'graphql-tag';

export default gql`
    query chatReportOverviewTopLabels($channel_codes: String = "", $from: Float = 1.5, $store_ids: String = "", $to: Float = 1.5, $type: String) {
        chatReportOverviewTopLabels(from: $from, to: $to, channel_codes: $channel_codes, store_ids: $store_ids, type: $type) {
          color
          countAttachment
          id
          title
        } 
    }
`;
