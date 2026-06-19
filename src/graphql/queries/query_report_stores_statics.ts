import gql from "graphql-tag";

export default gql`
    query report_stores_statics($to: Int!, $store_ids: String, $sources: String, $from: Int!, $channel_codes: String, $store_status: Int) {
        report_stores_statics(from: $from, to: $to, channel_codes: $channel_codes, sources: $sources, store_ids: $store_ids, store_status: $store_status) {
            smeId
            storeId
            items {
                increase
                prevValue
                title
                value
            }
        }
    }
`;
