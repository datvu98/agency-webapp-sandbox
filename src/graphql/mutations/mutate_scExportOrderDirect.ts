import gql from "graphql-tag";

export default gql`
mutation scExportOrderDirect(
	$sla_status: Int, 
	$sla_time: Int, 
	$list_store: [ScStoreDataInput!]!, 
	$fulfillment_by: Int, 
	$time_from: Int, 
	$time_to: Int, 
	$type: Int,
	$list_source: [String],
	$pack_status: [String],
	$agency_cancel_by_sla: Int
	) 
{
	scExportOrderDirect(sla_time: $sla_time, 
		sla_status: $sla_status, 
		list_store: $list_store, 
		fulfillment_by: $fulfillment_by, 
		time_from: $time_from, 
		time_to: $time_to, 
		type: $type, 
		list_source: $list_source,
		pack_status: $pack_status,
		agency_cancel_by_sla: $agency_cancel_by_sla
	) {
		job_id
		message
		success
	}
}

`;
