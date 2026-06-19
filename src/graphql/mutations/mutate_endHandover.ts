import gql from "graphql-tag";

export default gql`
	mutation endHandover($handoverListId: Int!) {
		endHandover(handoverListId: $handoverListId) {
			data {
				canceledItems {
					status
					systemPackageNumber
					totalQuantity
					trackingNumber
					warehouseBillCode
					warehouseBillId
				}
			}
			success
			message
		}
	}
`;
