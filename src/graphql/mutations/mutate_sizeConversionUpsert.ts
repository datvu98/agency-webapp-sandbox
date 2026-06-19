import gql from "graphql-tag";

export default gql`
	mutation sizeConversionUpsert($upsert: SizeConversionUpsertInput!) {
		sizeConversionUpsert(upsert: $upsert) {
			message
			success
		}
	}
`;
