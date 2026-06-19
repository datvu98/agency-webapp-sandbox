import gql from "graphql-tag";

export default gql`
	query sme_warehouses_by_pk($id: Int!) {
		sme_warehouses_by_pk(id: $id) {
			ward_code
			updated_at
			total_variants
			sme_id
			province_code
			outbound_prefix
			name
			is_default
			inbound_prefix
			id
			fulfillment_scan_export_mode
			fulfillment_provider_wms_code
			fulfillment_provider_connected_id
			fulfillment_by
			district_code
			created_at
			contact_phone
			contact_name
			code
			allow_preallocate
			address
			fulfillment_scan_pack_mode
			lat
			lng
			max_mio
			max_mixio
			max_sio
		}
	}
`;
