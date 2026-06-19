import gql from "graphql-tag";

export default gql`
	mutation upsertItemHandover($handoverListId: Int!, $warehouseBillId: Int!, $workSessionId: Int!) {
		upsertItemHandover(handoverListId: $handoverListId, warehouseBillId: $warehouseBillId, workSessionId: $workSessionId) {
			message
			success
			data {
				agencyId
				id
				items {
					storageEquipmentId
					warehouseBillId
				}
				picId
				picType
				totalQuantity
				totalVariants
			}
		}
	}
`;
