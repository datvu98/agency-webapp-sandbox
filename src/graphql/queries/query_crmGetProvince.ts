import gql from "graphql-tag";

export default gql`
	query crmGetProvince($is_new: Int) {
		crmGetProvince(is_new: $is_new) {
			code
			code_name
			name
			name_en
		}
	}
`;
