import gql from "graphql-tag";

export default gql`
  mutation scDeletePartnerAccount ($partner_account_id: Int!) {
    scDeletePartnerAccount (partner_account_id: $partner_account_id) {
      message
      success
    }
  }
`