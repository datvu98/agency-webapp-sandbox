import gql from "graphql-tag";

export default gql`
query scGetOperationFulfillmentSummaryRtsSlaTime($filter: FilterOperationRtsSlaTime) {
  scGetOperationFulfillmentSummaryRtsSlaTime(filter: $filter) {
    in_sla_1h30p
    in_sla_1h30p_12h
    in_sla_over_12h
    in_sla_over_1d_2d
    in_sla_over_2d
    out_sla_1h30p
    out_sla_1h30p_12h
    out_sla_over_12h
    out_sla_over_1d_2d
    out_sla_over_2d
  }
}
`;
