import gql from "graphql-tag";

export default gql`
  query ScGetSmeProducts($product_ids: [Int]) {
    ScGetSmeProducts(product_ids: $product_ids) {
      products {
        id
        productAssets {
          sme_url
        }
      }
    }
  }
`;