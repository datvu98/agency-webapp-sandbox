import gql from "graphql-tag";

export default gql`
	mutation storageEquipmentCreateBatch($createdBatch: StorageEquipmentCreateBatchInput!) {
		storageEquipmentCreateBatch(createdBatch: $createdBatch) {
			message
			success
		}
	}
`;
