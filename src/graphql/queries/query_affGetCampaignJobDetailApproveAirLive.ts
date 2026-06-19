import gql from 'graphql-tag'

export default gql`
    query affGetCampaignJobDetailApproveAirLive($id: Int!) {
        affGetCampaignJobDetail(id: $id) {
            data {
                job {
                    jobProducts {
                        id
                        productName
                        productImage
                    }
                    liveSessionCount
                }
            }
        }
    }
`