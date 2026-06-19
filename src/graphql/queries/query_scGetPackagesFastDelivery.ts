import gql from 'graphql-tag';

export default gql`
query scGetPackagesFastDelivery($filter: FilterGetPackagesFastDelivery) {
  scGetPackagesFastDelivery(filter: $filter) {
    packages {
      order {
        ref_id
        order_at
        store_id
      }
      shipping_carrier
      connector_channel_code
      created_at
      connector_channel_error
      warehouse_error_message
      time_fast_delivery
    }
    total_package
  }
}
`;