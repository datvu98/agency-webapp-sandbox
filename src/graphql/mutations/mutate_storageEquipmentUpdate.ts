import gql from "graphql-tag";

export default gql`
	mutation storageEquipmentUpdate($updated: StorageEquipmentUpdateInput!) {
		storageEquipmentUpdate(updated: $updated) {
			message
			success
		}
	}
`;
