import gql from 'graphql-tag';

export default gql`
query scGetOperationFulfillmentTrackingRtsSlaTime( $filter: FilterOperationRtsSlaTime) {
  scGetOperationFulfillmentTrackingRtsSlaTime(filter: $filter) {
    sme_id
    store_id
    total_package
    total_pending
    total_platform_error
    total_warehouse_error
  }
}
`