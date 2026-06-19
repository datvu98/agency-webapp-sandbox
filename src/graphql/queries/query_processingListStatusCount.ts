import gql from "graphql-tag";

export default gql`
	query processingListStatusCount($where: ProcessingListWhereInput) {
		processingListStatusCount(where: $where) {
			message
			success
			data {
				cancelled
				new
				partiallyPicked
				pickStepCreated
				picked
				picking
				readyPickup
				total
			}
		}
	}
`;
