import gql from 'graphql-tag';

export default gql`
query coGetShippingCarrierFromListPackage($search: SearchPackage) {
  coGetShippingCarrierFromListPackage(search: $search) {
    message
    success
    data {
      number_package
      shipping_carrier
    }
  }
}



`