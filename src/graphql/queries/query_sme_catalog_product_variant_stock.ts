import gql from "graphql-tag";

export default gql`
	query sme_catalog_product_variant($limit: Int = 200, $offset: Int = 0, $where: sme_catalog_product_variant_bool_exp = {}, $order_by: [sme_catalog_product_variant_order_by!] = {}) {
		sme_catalog_product_variant(limit: $limit, offset: $offset, where: $where, order_by: $order_by) {
			sme_brand_id
			sme_brand {
				name
				is_default
				id
			}
			id
			cost_price
			product_status_id
			product_status_code
			product_status_name
			variant_full_name
			is_multi_unit
			gtin
			name
			price
			is_combo
			price_minimum
			sku
			stock_warning
			combo_items {
				quantity
				variant_id
				combo_variant_id
				combo_item {
					sku
					product_id
				}
			}
			attributes {
				sme_catalog_product_attribute_value {
					name
				}
			}
			sme_catalog_product {
				name
				id
				is_multi_unit
			}
			sme_catalog_product_variant_assets {
				asset_url
			}
			unit
			variant_unit {
				id
				is_main
				name
				main_variant_id
				description
			}
		}
	}
`;
