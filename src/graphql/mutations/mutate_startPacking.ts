import gql from "graphql-tag";

export default gql`
	mutation startPacking($workStationId: Int!, $storageEquipmentId: Int!) {
		startPacking(storageEquipmentId: $storageEquipmentId, workStationId: $workStationId) {
			message
			success
			data {
				id
			}
		}
	}
`;
