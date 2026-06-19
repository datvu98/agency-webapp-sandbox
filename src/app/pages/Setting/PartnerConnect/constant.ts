export const PARTNER_ACCOUNT_STATUS_ACTIVE = 1
export const PARTNER_ACCOUNT_STATUS_INACTIVE = 0
export const PARTNER_ACCOUNT_STATUS_EXPIRED = 2

export const PARTNER_ACCOUNT_STATUS = [
  {
    value: PARTNER_ACCOUNT_STATUS_ACTIVE,
    label: 'Đang kết nối',
  },
  {
    value: PARTNER_ACCOUNT_STATUS_INACTIVE,
    label: 'Tạm dừng',
  },
  {
    value: PARTNER_ACCOUNT_STATUS_EXPIRED,
    label: 'Đã hết hạn',
  }
]