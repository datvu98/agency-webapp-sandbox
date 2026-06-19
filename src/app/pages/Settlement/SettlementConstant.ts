
const SERVICE_TYPES = [
  { value: 2, label: 'Kho dịch vụ' },
  { value: 1, label: 'Kho nhà bán' }
]

const SOURCE_TYPES = [
  { value: 'manual', label: 'Đơn thủ công' },
  { value: 'pos', label: 'Đơn POS' }
]

const TIME_TYPES = [
  { value: 1, label: 'Thời gian quyết toán' },
  { value: 2, label: 'Thời gian đơn hàng hoàn thành' },
  { value: 3, label: 'Thời gian tạo đơn hàng' }
]

const SEARCH_TYPES = [
  { value: 1, label: 'Mã đơn hàng' },
]

const TABS = [
  { key: 'PENDING', label: 'Chờ quyết toán' },
  { key: 'PROCESSED', label: 'Đã quyết toán' },
]

const DEFAULT_TABS = [
  { key: '1', label: 'Trong vòng 90 ngày' },
  { key: '2', label: 'Lịch sử' },
]


export {
  SERVICE_TYPES,
  SOURCE_TYPES,
  TABS,
  DEFAULT_TABS,
  TIME_TYPES,
  SEARCH_TYPES
};