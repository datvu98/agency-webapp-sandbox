import gql from 'graphql-tag';
export default gql`
    mutation scExportOrderFastDelivery (
        $list_store: [ScStoreDataInput!]!,
        $time_from: Int,
        $time_to: Int,
        $fulfillment_by: Int,
        $status: String,
        $time_slot: String
    ) {
        scExportOrderFastDelivery(list_store: $list_store, time_from: $time_from, time_to: $time_to, fulfillment_by: $fulfillment_by, status: $status, time_slot: $time_slot) {
            job_id
            link    
            message
            success
        }
    }
`;