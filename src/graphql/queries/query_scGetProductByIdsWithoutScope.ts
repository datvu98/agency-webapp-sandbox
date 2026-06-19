import gql from "graphql-tag";

export default gql`
  query scGetProductByIdsWithoutScope($product_ids: [Int]!, $sme_id: Int!) {
    scGetProductByIdsWithoutScope(product_ids: $product_ids, sme_id: $sme_id) {
      id
      productAssets {
        id
        sme_url
      }
      productVariants {
        id
        name
        stock_on_hand
        sc_product_id
        sku
      }
    }
  }
`;