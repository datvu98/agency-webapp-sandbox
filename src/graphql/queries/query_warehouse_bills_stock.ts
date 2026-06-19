import gql from "graphql-tag";

export default gql`
	query warehouse_bills($where_items: warehouse_bill_items_bool_exp, $limit: Int, $offset: Int, $where: warehouse_bills_bool_exp, $order_by: [warehouse_bills_order_by!]) {
		warehouse_bills(limit: $limit, offset: $offset, where: $where, order_by: $order_by) {
			code
			id
			order_code
			bill_items(where: $where_items) {
				id
				quantity
				quantity_plan
				variant_id
			}
		}
	}
`;
