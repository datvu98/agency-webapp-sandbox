import gql from "graphql-tag";

export default gql`
	mutation processingListCreate($data: ProcessingListCreateInput!, $where: SmeWarehouseBillWhereInput!) {
		processingListCreate(data: $data, where: $where) {
			message
			success
			data {
				totalProcessingListsCreated
				totalWarehouseBillFailed
				totalWarehouseBillProcessed
				totalWarehouseBillSuccess
				warehouseBillErrors {
					error
					warehouseBillCode
					warehouseBillId
				}
			}
		}
	}
`;
