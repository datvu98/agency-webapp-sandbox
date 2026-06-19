import gql from "graphql-tag";

export default gql`
	query workSessionGetById($id: Int!) {
		workSessionGetById(id: $id) {
			data {
				work {
					targetId
					id
					code
					previousWorkId
					previousWorkSessionId
				}
				totalVariants
				totalQuantity
				id
				endedAt
				devices {
					id
					removedAt
					sequence
					storageEquipmentId
					totalQuantity
					totalVariants
				}
				picId
				picType
				startedAt
				status
			}
				meta {
				cached
			}
		}
	}
`;
