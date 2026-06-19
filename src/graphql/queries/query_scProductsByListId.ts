import gql from 'graphql-tag';

export default gql`
query scGetSmeProductByListId($list_product_id: [Int], $list_ref_product_id: [String]) {
  scGetSmeProductByListId(list_product_id: $list_product_id, list_ref_product_id: $list_ref_product_id) {    
    connector_channel_code
    created_at
    updated_at
    id
    name
    sku
    merge_price
    merge_stock
    platform_status
    platform_text_status
    package_height
    package_length
    package_weight
    package_width
    ref_brand_id
    ref_brand_name
    ref_url
    ref_id
    sum_stock_on_hand      
    productAssets {
      id
      ref_id
      ref_url
      sc_product_id
      sme_asset_id
      sme_url
      type
      position
      origin_image_url
      template_image_url
    }
    productVariants {
      id
      name
      price
    } 
    productVariantAttributes {
      id
      name        
    }
    ref_category_id
    ref_id
    sc_brand_id
    sc_category_id
    status
    store_id
    sync_error_message
    sync_status
    warranty_period
    warranty_type
    warranty_policy
    sme_product_id      
    price
    description
    description_html
    short_description      
    stock_on_hand
  }  
}
`;
