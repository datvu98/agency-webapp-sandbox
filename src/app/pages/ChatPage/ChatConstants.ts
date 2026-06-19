const OPTIONS_PAYMENT_METHOD = [
  { value: 'Thanh toán khi nhận hàng', label: 'Thanh toán khi nhận hàng' },
  { value: 'Thanh toán ngay - tiền mặt', label: 'Thanh toán ngay - tiền mặt' },
  { value: 'Thanh toán ngay - chuyển khoản', label: 'Thanh toán ngay - chuyển khoản', }
];

const OPTIONS_FEE_BEARER = [
  { value: 1, label: 'Người nhận' },
  { value: 2, label: 'Người bán' },
];

const OPTIONS_UNIT = [
  { label: 'đ', value: 0 },
  { label: '%', value: 1 },
]

export { OPTIONS_PAYMENT_METHOD, OPTIONS_UNIT, OPTIONS_FEE_BEARER };

