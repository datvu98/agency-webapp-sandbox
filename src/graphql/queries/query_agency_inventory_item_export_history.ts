import gql from "graphql-tag";

export default gql`
	query agency_inventory_item_export_history(
		$order_by: [agency_inventory_item_export_history_order_by!]
		$where: agency_inventory_item_export_history_bool_exp
		$distinct_on: [agency_inventory_item_export_history_select_column!]
		$limit: Int
		$offset: Int
	) {
		agency_inventory_item_export_history(distinct_on: $distinct_on, limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
			agency_id
			created_at
			deleted_at
			file_path
			filter
			id
			message
			session_variables
			status
			total_records
			updated_at
		}
		agency_inventory_item_export_history_aggregate(distinct_on: $distinct_on, order_by: $order_by, where: $where) {
			aggregate {
				count
			}
		}
	}
`;
