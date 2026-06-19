import gql from "graphql-tag";

export default gql`
	query vrCmsContractAuditHistory($filter: CmsContractAuditFilterInput!) {
		vrCmsContractAuditHistory(filter: $filter) {
			success
			message
			data {
				auditable_id
				created_at
				event
				id
				ip_address
				new_values
				old_values
				url
				user_agent
				user_id
				user_type
			}
			metadata {
				current_page
				from
				per_page
				to
				total
				total_pages
			}
		}
	}
`;
