import gql from "graphql-tag";

export default gql`
	query smeWarehouseByAgency($limit: Int, $offset: Int, $order_by: SmeWarehouseOrderBy = {}, $where: SmeWarehouseWhere = {status: {_eq: 10}}) {
		smeWarehouseByAgency(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
			message
			success
			meta {
				total
			}
			data {
				address
				allow_preallocate
				code
				lat
				lng
				id
				is_default
				is_location_manage
				outbound_prefix
				fulfillment_provider_connected_id
				fulfillment_by
				fulfillment_scan_export_mode
				fulfillment_scan_pack_mode
				fulfillment_provider_wms_name
				fulfillment_provider_wms_code
				inbound_prefix
				name
				district_code
				max_mio
				max_sio
				max_mixio
				province_code
				ward_code
				contact_phone
				contact_name
				sme_id
				total_variants
				status
				is_report_inventory
				report_inventory_complete_at
			}
		}
	}
`;
