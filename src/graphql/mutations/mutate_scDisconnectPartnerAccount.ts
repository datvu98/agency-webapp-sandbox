import gql from "graphql-tag";

export default gql`
  mutation scDisconnectPartnerAccount ($partner_account_id: Int!) {
    scDisconnectPartnerAccount (partner_account_id: $partner_account_id) {
      message
      success
    }
  }
`