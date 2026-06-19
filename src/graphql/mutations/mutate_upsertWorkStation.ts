import gql from "graphql-tag";

export default gql`
	mutation upsertWorkStation($upserted: WorkStationUpsertInput!) {
		upsertWorkStation(upserted: $upserted) {
			message
			success
		}
	}
`;
