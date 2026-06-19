export const OPTION_STATUS = [
  {
    label: 'Mới',
    value: 'NEW'
  },
  {
    label: 'Đang xử lý',
    value: 'PROCESSING'
  },
  {
    label: 'Hoàn thành',
    value: 'COMPLETED'
  }
]

export const OPTION_TIME = [
  {
    label: 'Ngày tạo phiếu',
    value: 'createdAt'
  },
  {
    label: 'Ngày bàn giao',
    value: 'handoverAt'
  },
]

export const OPTION_CANCEL_HANDOVER_TIME = [
  {
    label: 'Thời gian phát sinh huỷ',
    value: 'cancelAt'
  },
  {
    label: 'Thời gian tạo phiên',
    value: 'createdAt'
  },
]

export const OPTION_ABNORMAL_TIME = [
  {
    label: 'Thời gian giao hàng',
    value: 'shippedAt'
  },
]
export const OPTION_SHIPPING_CARRIERS = [
  {
    label: 'SPX Express',
    value: 'SPX'
  },
  {
    label: 'Giao hàng nhanh',
    value: 'GHN'
  },
  {
    label: 'J&T Express',
    value: 'JTE'
  },
  {
    label: 'Viettel Post',
    value: 'VTP'
  },
  {
    label: 'Vietnam Post',
    value: 'VNP'
  },
  {
    label: 'Grab',
    value: 'GRAB'
  },
  {
    label: 'Giao hàng Tiết kiệm',
    value: 'GHTK'
  },
  {
    label: 'Aha Move',
    value: 'AHA'
  },
  {
    label: 'Be',
    value: 'BE'
  },
  {
    label: 'Lazada Express',
    value: 'LEX'
  },
  {
    label: 'BEST Express',
    value: 'BEST'
  }
]

export const TABS = [
  {
    key: 'handover',
    label: 'Bàn giao xuất hàng'
  },
  {
    key: 'cancelHandover',
    label: 'Huỷ trong khi bàn giao'
  },
  {
    key: 'abnormal',
    label: 'Bất thường'
  }
]