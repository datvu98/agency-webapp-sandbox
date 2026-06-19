import gql from "graphql-tag";

export default gql`
	query sme_catalog_product_variant($limit: Int, $offset: Int, $where: sme_catalog_product_variant_bool_exp = {}, $order_by: [sme_catalog_product_variant_order_by!] = {}) {
		sme_catalog_product_variant(limit: $limit, offset: $offset, where: $where, order_by: $order_by) {
			id
			stock_on_hand
			created_at
			product_status_name
			product_status_code
			variant_full_name
			name
			sku
			gtin
			size
			updated_at
			unit
			sme_catalog_product {
				name
			}
			sme_catalog_product_variant_assets {
				asset_url
			}
		}
	}
`;
