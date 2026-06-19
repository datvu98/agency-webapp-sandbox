import gql from "graphql-tag";

export default gql`
	query smeWarehouses($where: sme_warehouses_bool_exp, $order_by: [sme_warehouses_order_by!]) {
		sme_warehouses(where: $where, order_by: $order_by) {
			id
			name
			code
			sme_id
		}
	}
`;
