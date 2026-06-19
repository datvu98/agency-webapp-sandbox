import gql from "graphql-tag";

export default gql`
	query sme_product_status($order_by: [sme_product_status_order_by!]) {
		sme_product_status(order_by: $order_by) {
			created_at
			global_status_id
			id
			name
			sme_id
			status
			status_code
			updated_at
		}
	}
`;
