import gql from "graphql-tag";

export default gql`
	query processingListShowLocationWarehouseBill($id: Int!, $warehouseBillId: Int!) {
		processingListShowLocationWarehouseBill(id: $id, warehouseBillId: $warehouseBillId) {
			data {
				expiredAt
        lotNumber
        quantity
        storageEquipmentCode
        storageEquipmentId
			}
		}
	}
`;
