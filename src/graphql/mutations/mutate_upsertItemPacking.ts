import gql from "graphql-tag";

export default gql`
	mutation upsertItemPacking($item: WorkSessionItemCreateInput!, $workSessionId: Int!) {
		upsertItemPacking(item: $item, workSessionId: $workSessionId) {
			message
			success
			data {
				status
				totalQuantity
				totalVariants
				unique
				updatedAt
				workId
				agencyId
				id
				picId
				picType
				startedAt
			}
		}
	}
`;
