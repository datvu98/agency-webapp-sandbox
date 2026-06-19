import gql from "graphql-tag";

export default gql`
	mutation vrUpsertCmsContract(
		$begin_at: String!
		$description: String
		$end_at: String!
		$id: Int
		$note: String
		$sme_id: Int!
		$store_ids: [Int!]
		$title: String!
	) {
		vrUpsertCmsContract(begin_at: $begin_at, end_at: $end_at, sme_id: $sme_id, title: $title, description: $description, id: $id, note: $note, store_ids: $store_ids) {
			message
			success
		}
	}
`;
