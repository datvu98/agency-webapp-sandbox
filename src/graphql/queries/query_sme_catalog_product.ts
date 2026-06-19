import gql from "graphql-tag";

export default gql`
	query sme_catalog_product($distinct_on: [sme_catalog_product_select_column!], $limit: Int, $offset: Int, $order_by: [sme_catalog_product_order_by!], $where: sme_catalog_product_bool_exp) {
		sme_catalog_product(distinct_on: $distinct_on, limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
			id
			name
			sme_catalog_product_variants {
				attributes {
					sme_catalog_product_attribute_value {
						name
					}
				}
				is_multi_unit
				unit
				variant_unit {
					id
					is_main
					main_variant_id
				}
			}
		}
	}
`;
