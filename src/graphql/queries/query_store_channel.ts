import gql from "graphql-tag";

export default gql`
	query MyQuery($context: String) {
		sc_stores(context: $context) {
			name
			id
			connector_channel_code
		}
		op_connector_channels {
			name
			logo_asset_url
			code
			id
		}
	}
`;
