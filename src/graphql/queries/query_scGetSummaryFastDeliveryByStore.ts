import gql from 'graphql-tag';

export default gql`
query scGetSummaryFastDeliveryByStore($filter: FilterSummaryFastDeliveryByStore) {
  scGetSummaryFastDeliveryByStore(filter: $filter) {
    sme_id
    store_id
    total_package
    total_platform_error
    total_warehouse_error
  }
}
`;