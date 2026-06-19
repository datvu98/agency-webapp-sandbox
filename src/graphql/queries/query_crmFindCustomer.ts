import gql from "graphql-tag";

export default gql`
  query crmFindCustomer($ref_customer_id: String) {
    crmFindCustomer(ref_customer_id: $ref_customer_id) {        
        address
        connector_channel_code
        count_order
        count_product        
        crmTag {
            created_at
            id
            sme_id
            title
            updated_at
        }
        crmStore {
            connector_channel_code
            crm_customer_id
            id
            store_id
        }
        district_code
        email
        id
        last_order_at
        name
        phone
        seller_username
        sc_customer_id
        ref_customer_id
        province_code
        total_paid
        sme_id
        total_rating                
    }
  }
`;
