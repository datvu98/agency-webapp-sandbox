import gql from "graphql-tag";

export default gql`
	query printMinutesHandoverList($handoverListId: Int!) {
		printMinutesHandoverList(handoverListId: $handoverListId) {
			data {
				url
				canceledItems {
					status
					systemPackageNumber
					totalQuantity
					trackingNumber
					warehouseBillCode
					warehouseBillId
				}
			}
			message
			success
		}
	}
`;
