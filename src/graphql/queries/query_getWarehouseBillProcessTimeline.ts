import gql from "graphql-tag";

export default gql`
	query getWarehouseBillProcessTimeline($id: Int!) {
		getWarehouseBillProcessTimeline(id: $id) {
			message
			success
			data {
				packEnded {
					at
					by {
						id
						type
					}
				}
				packStarted {
					at
					by {
						id
						type
					}
				}
				pickEnded {
					at
					by {
						id
						type
					}
				}
				pickStarted {
					at
					by {
						id
						type
					}
				}
				pickStepCreated {
					at
					by {
						id
						type
					}
				}
				processingListAssigned {
					at
					by {
						id
						type
					}
				}
				processingListCreated {
					at
					by {
						id
						type
					}
				}
				handoverEnded {
					at
					by {
						id
						type
					}
				}
				handoverStarted {
					at
					by {
						id
						type
					}
				}
			}
		}
	}
`;
