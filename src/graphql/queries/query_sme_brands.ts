import gql from "graphql-tag";

export default gql`
	query sme_brands($where: sme_brands_bool_exp, $order_by: [sme_brands_order_by!]) {
		sme_brands(where: $where, order_by: $order_by) {
			id
			sme_id
			is_default
			name
			is_number_one
		}
	}
`;
