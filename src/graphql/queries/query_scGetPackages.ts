import gql from 'graphql-tag';

export default gql`
query scGetPackages($page: Int!, $per_page: Int!, $search: SearchPackage) {
  scGetPackages(page: $page, per_page: $per_page, order_by: "order_at", order_by_type: "desc", search: $search) {
    connector_channel_code
    connector_channel_error
    warehouse_error_message
    created_at
    shipping_carrier
    order {
      ref_id
      order_at
      store_id
      status
      shipped_at
      tts_expired
      logisticsPackages {
        pack_status
      }
      rts_sla_time
    }
  }
  scPackageAggregate(search: $search) {
    count
  }
}


`