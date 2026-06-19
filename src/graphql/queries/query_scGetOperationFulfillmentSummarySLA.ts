import gql from 'graphql-tag';

export default gql`
query scGetOperationFulfillmentSummarySLA($filter: FilterOperation = {}) {
  scGetOperationFulfillmentSummarySLA(filter: $filter) {
    in_sla_6h
    in_sla_6h_9h
    in_sla_9h_12h
    in_sla_over_12h
    in_sla_over_1d_2d
    in_sla_over_2d_3d
    in_sla_over_3d
    out_sla_6h
    out_sla_6h_9h
    out_sla_9h_12h
    out_sla_over_12h
    out_sla_over_1d_2d
    out_sla_over_2d_3d
    out_sla_over_3d
    pack_status
  }
}
`