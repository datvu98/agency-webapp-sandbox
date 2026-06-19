import gql from 'graphql-tag'

export default gql`
    query findOrderByIds($ids: [Int!]!, $sme_id: Int!) {
        findOrderByIds(ids: $ids, sme_id: $sme_id) {
            id
            customerRecipientAddress {
              full_address
              full_name
              phone 
            }
            ref_id
            logisticsPackages {
                id
                tracking_number

                packHistory {
                    pack_name
                    pack_status
                    updated_at
                }

                logisticsTrackingInfo {
                    description
                    tracking_update_time
                }
            }
        }
    }
`
