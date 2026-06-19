import gql from "graphql-tag";

export default gql`
	mutation storageEquipmentBulkCreateByFile($created: StorageEquipmentBulkCreateByFileInput!) {
		storageEquipmentBulkCreateByFile(created: $created) {
			message
			success
			data {
				code
				error
				name
			}
			meta {
				failed
				success
				total
			}
		}
	}
`;
