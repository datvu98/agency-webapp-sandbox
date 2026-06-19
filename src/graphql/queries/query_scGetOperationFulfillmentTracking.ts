import gql from 'graphql-tag';

export default gql`
query scGetOperationFulfillmentTracking( $filter: FilterOperation) {
  scGetOperationFulfillmentTracking(filter: $filter) {
    sme_id
    store_id
    total_cancel_by_tts_expired
    total_express
    total_package
    total_packed
    total_packing
    total_pending
    total_platform_error
    total_to_provider_wms
    total_to_self_wms
    total_to_smart_wms
    total_tts_expire_soon
    total_tts_expired
    total_warehouse_error
  }
}

`