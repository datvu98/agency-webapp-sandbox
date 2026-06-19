import gql from "graphql-tag";

export default gql`
	query listReturnReceiptShippingCarriers {
		listReturnReceiptShippingCarriers {
			data {
				code
				name
			}
		}
	}
`;
