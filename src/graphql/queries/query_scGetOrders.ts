import gql from "graphql-tag";

export default gql`
  query scGetOrders($ref_customer_id: String, $page: Int!, $per_page: Int!, $list_store: [Int!]) {
    scGetOrders(search: {ref_customer_id: $ref_customer_id, list_store: $list_store}, page: $page, per_page: $per_page) {
      sync_error
      buyer_cancel_reason
      cancel_by
      connector_channel_code
      created_at
      order_at
      currency_code
      tts_expired
      shipped_at
      completed_at
      cancel_at
      shipment_param_payload {
        pickup {
          address_list {
            address_id
            address_flag
            address
            city
            district
            state
            time_slot_list {
              date
              time_text
              pickup_time_id
            }
          }
        }
      }
      customer {
        connector_channel_code
        created_at
        full_name
        id
        phone
        ref_id
        user_name
        updated_at
      }
      customer_id
      id
      is_paid
      message_to_seller
      note
      platform_status_text
      orderItems {
        connector_channel_code
        created_at
        id
        is_gift
        order_id
        original_price
        paid_price
        product_name
        quantity_purchased
        reason
        reason_detail
        ref_order_id
        ref_product_id
        ref_variant_id
        variant_name
        variant_image
        variant_sku
        sc_product_id
        sc_variant_id
        sme_id
        store_id
        updated_at
        sme_product_id
        sme_variant_id
        warehouse_error_code
        warehouse_error_message
      }
      original_price
      paid_price
      sme_note
      payment_method
      platform_status
      promotion_platform_amount
      promotion_seller_amount
      customerRecipientAddress {
        city
        connector_channel_code
        created_at
        customer_id
        district
        full_address
        full_name
        id
        phone
        region
        state
        town
        updated_at
        zip_code
      }
      logisticsPackages {
        id
        tracking_number
        package_number
        shipping_carrier
        sc_warehouse_id
        sme_warehouse_id
        print_status
        s3_document
        pack_status
        pack_abnormal
        warehouse_step
        connector_channel_error
        warehouse_error_message
        logisticsTrackingInfo{
          id
          tracking_update_time
          description
          package_id
          created_at
          updated_at
        }
      }
      returnOrder {
        id
        reverse_request_time
      }
      updated_at
      update_time
      store_id
      source
      status
      sme_id
      shipping_original_fee
      shipping_discount_seller_fee
      shipping_discount_platform_fee
      ref_store_id
      ref_number
      ref_id
      recipient_address_id
      p_delivery_method 
    }
  }
`