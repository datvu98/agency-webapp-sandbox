export enum PROCESS_STATUS {
  PENDING = "pending",
  PENDING_SHIPMENT = "pending_shipment",
  SHIPPING_IN_PROGRESS = "shipping_in_progress",
  PENDING_POSTING = "pending_posting",
  PENDING_REVIEW = "pending_review",
  PENDING_AIRING = "pending_airing",
  PENDING_ACCEPTANCE = "pending_acceptance",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export const PROCESS_STATUS_OPTIONS = [
  { label: "Chờ duyệt", value: PROCESS_STATUS.PENDING, index: 1 },
  { label: "Chờ gửi hàng", value: PROCESS_STATUS.PENDING_SHIPMENT, index: 2 },
  { label: "Đang gửi hàng", value: PROCESS_STATUS.SHIPPING_IN_PROGRESS, index: 3 },
  { label: "Chờ lên bài", value: PROCESS_STATUS.PENDING_POSTING, index: 4 },
  { label: "Chờ duyệt demo", value: PROCESS_STATUS.PENDING_REVIEW, index: 5 },
  { label: "Chờ đăng bài", value: PROCESS_STATUS.PENDING_AIRING, index: 6 },
  { label: "Chờ nghiệm thu", value: PROCESS_STATUS.PENDING_ACCEPTANCE, index: 7 },
  { label: "Hoàn thành", value: PROCESS_STATUS.COMPLETED, index: 8, status: 'finished' },
]

export const PROCESS_STATUS_OPTIONS_CANCELLED = [
  { label: "Chờ duyệt", value: PROCESS_STATUS.PENDING, index: 1, status: 'wait' },
  { label: "Hủy", value: PROCESS_STATUS.CANCELLED, index: 2, status: 'error' },
]

export const PROCESS_STATUS_OPTIONS_HAS_DEMO_APPROVAL = [
  { label: "Chờ duyệt", value: PROCESS_STATUS.PENDING, index: 1 },
  { label: "Chờ gửi hàng", value: PROCESS_STATUS.PENDING_SHIPMENT, index: 2 },
  { label: "Đang gửi hàng", value: PROCESS_STATUS.SHIPPING_IN_PROGRESS, index: 3 },
  { label: "Chờ đăng bài", value: PROCESS_STATUS.PENDING_AIRING, index: 4 },
  { label: "Chờ nghiệm thu", value: PROCESS_STATUS.PENDING_ACCEPTANCE, index: 5 },
  { label: "Hoàn thành", value: PROCESS_STATUS.COMPLETED, index: 6, status: 'finished' },
]

export enum ASSET_STATUS {
  PENDING_DEMO = "pending_demo",
  ACCEPTED_DEMO = "accepted_demo",
  REJECTED_DEMO = "rejected_demo",
  PENDING_AIR = "pending_air",
  ACCEPTED_AIR = "accepted_air",
  REJECTED_AIR = "rejected_air",
}

export const ASSET_STATUS_OPTIONS = [
  { label: "Chờ duyệt", value: ASSET_STATUS.PENDING_DEMO },
  { label: "Đã duyệt", value: ASSET_STATUS.ACCEPTED_DEMO },
  { label: "Bị từ chối", value: ASSET_STATUS.REJECTED_DEMO },
  { label: "Chờ đăng bài", value: ASSET_STATUS.PENDING_AIR },
  { label: "Đã duyệt đăng bài", value: ASSET_STATUS.ACCEPTED_AIR },
  { label: "Từ chối đăng bài", value: ASSET_STATUS.REJECTED_AIR },
]

export enum CANCELLED_BY {
  CREATOR = "hub",
  AGENCY = "agency",
}

export const CANCELLED_BY_OPTIONS = [
  { label: "Hủy bởi nhà sáng tạo", value: CANCELLED_BY.CREATOR },
  { label: "Hủy bởi nhãn hàng", value: CANCELLED_BY.AGENCY },
]