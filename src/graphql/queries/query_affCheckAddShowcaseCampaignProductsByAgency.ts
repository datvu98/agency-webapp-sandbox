import gql from "graphql-tag"; 

export default gql`
    query affCheckAddShowcaseCampaignProductsByAgency($input: CheckAddShowcaseCampaignProductsInput!) {
        affCheckAddShowcaseCampaignProductsByAgency(input: $input) {
            success
            message
            data {
                items {
                  id
                }
            }
        }
    }
`