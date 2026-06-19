import gql from "graphql-tag";

export default gql`
	mutation storageEquipmentCreate($created: StorageEquipmentCreateInput!) {
		storageEquipmentCreate(created: $created) {
			message
			success
		}
	}
`;
