import gql from 'graphql-tag';
export default gql`
query scGetOperationFulfillmentSummaryFastDelivery($filter: FilterOperationFastDelivery){
  scGetOperationFulfillmentSummaryFastDelivery(filter: $filter) {
    delivery_pending_rate
    fast_delivery_rate
    report_fast_delivery_by_store {
      fast_delivery_rate
      store_id
      store_time_slots_report {
        label
        delivery_rate_packed
        fast_delivery_rate
        time_range_key
        total_order
        total_packed
        total_packing
        total_shipped
        total_unprocessed
      }
      total_fast_order
      total_order
    }
    summary_by_time_slot {
      delivery_rate_packed
      fast_delivery_rate
      label
      time_range_key
      total_order
      total_packed
      total_packing
      total_shipped
      total_unprocessed
    }
    total_fast_order
    total_fast_order_pending
    total_order
  }
}
`;
