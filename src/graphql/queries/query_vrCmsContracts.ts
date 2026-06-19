import gql from "graphql-tag";

export default gql`
    query vrCmsContracts(
        $sme_id: Int!
        $search: String
        $date_range_start: String
        $date_range_end: String
        $page: Int
        $per_page: Int
        $statuses: [Int!]
        $store_ids: [Int!]
    ) {
        vrCmsContracts(
            filter: {
                sme_id: $sme_id
                search: $search
                date_range_start: $date_range_start
                date_range_end: $date_range_end
                page: $page
                per_page: $per_page
                statuses: $statuses
                store_ids: $store_ids
            }
        ) {
            message
            success
            data {
                id
                title
                description
                note
                sme_id
                store_ids
                status
                begin_at
                end_at
                created_at
                updated_at
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
