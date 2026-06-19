export enum TAB_KEYS {
  REGISTER_SAMPLE = "register-sample",
  ADD_SHOWCASE = "add-showcase",
}

export type TabKey = typeof TAB_KEYS[keyof typeof TAB_KEYS];

export const DEFAULT_TAB: TabKey = TAB_KEYS.REGISTER_SAMPLE;

export const TAB_ITEMS = [
  { key: TAB_KEYS.REGISTER_SAMPLE, label: "Quản lý job" },
  { key: TAB_KEYS.ADD_SHOWCASE, label: "Thêm trang trưng bày" },
];

export enum REGISTER_SAMPLE_STATUS {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export const APPROVE_SAMPLE_ERROR_CODE = {
  STOCK_UNAVAILABLE: "100",
} as const;

// Giá trị khớp với API (PENDING | APPROVED | REJECTED)
export const REGISTER_SAMPLE_STATUS_OPTIONS = [
  { label: "Chờ duyệt", value: REGISTER_SAMPLE_STATUS.pending },
  { label: "Đã duyệt", value: REGISTER_SAMPLE_STATUS.approved },
  { label: "Từ chối", value: REGISTER_SAMPLE_STATUS.rejected },
];

export const ADVERTISING_TYPE_OPTIONS = [
  { label: "Video", value: "video" },
  { label: "Livestream", value: "live" },
];

export enum ETYPE_TIME {
  CREATED_AT = "created_at",
  SUBMITTED_AT = "demo_submitted_at",
  VIDEO_DEADLINE = "video_deadline",
  SENT_REVIEW = "post_submitted_at",
  POST_DEADLINE = "post_deadline",
}

export const TYPE_TIME_OPTIONS = [
  { label: "Thời gian đăng ký", value: ETYPE_TIME.CREATED_AT },
  { label: "Thời gian gửi demo", value: ETYPE_TIME.SUBMITTED_AT },
  { label: "Hạn gửi demo", value: ETYPE_TIME.VIDEO_DEADLINE },
  { label: "Thời gian gửi nghiệm thu", value: ETYPE_TIME.SENT_REVIEW },
  { label: "Hạn đăng bài", value: ETYPE_TIME.POST_DEADLINE },
];

export enum ETYPE_PROCESS_STATUS {
  ALL = "all",
  PENDING = "pending",
  PENDING_SHIPMENT = "pending_shipment",
  SHIPPING_IN_PROGRESS = "shipping_in_progress",
  PENDING_POSTING = "pending_posting",
  PENDING_REVIEW = "pending_review",
  PENDING_AIRING = "pending_airing",
  PENDING_ACCEPTANCE = "pending_acceptance",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NEED_PROCESS = "need_process",
}

export const TYPE_PROCESS_STATUS_OPTIONS = [
  { label: "Tất cả", value: ETYPE_PROCESS_STATUS.ALL },
  { label: "Chờ duyệt", value: ETYPE_PROCESS_STATUS.PENDING },
  { label: "Chờ gửi hàng", value: ETYPE_PROCESS_STATUS.PENDING_SHIPMENT },
  { label: "Cần xử lý", value: ETYPE_PROCESS_STATUS.NEED_PROCESS },
  { label: "Đang gửi hàng", value: ETYPE_PROCESS_STATUS.SHIPPING_IN_PROGRESS },
  { label: "Chờ lên bài", value: ETYPE_PROCESS_STATUS.PENDING_POSTING },
  { label: "Chờ duyệt demo", value: ETYPE_PROCESS_STATUS.PENDING_REVIEW },
  { label: "Chờ đăng bài", value: ETYPE_PROCESS_STATUS.PENDING_AIRING },
  { label: "Chờ nghiệm thu", value: ETYPE_PROCESS_STATUS.PENDING_ACCEPTANCE },
  { label: "Hoàn thành", value: ETYPE_PROCESS_STATUS.COMPLETED },
  { label: "Đã hủy", value: ETYPE_PROCESS_STATUS.CANCELLED },
];

export const CANCELLED_BY_HUB = "hub";
export const CANCELLED_BY_AGENCY = "agency";

export const CANCEL_BY_OPTIONS = [
  { label: "Hủy bởi nhãn hàng", value: CANCELLED_BY_AGENCY },
  { label: "Hủy bởi nhà sáng tạo", value: CANCELLED_BY_HUB },
];

export enum EORDER_STATUS {
  PENDING = "PENDING",
  pending = "pending",
  packing = "packing",
  packed = "packed",
  shipping = "shipping",
  shipped = "shipped",
  completed = "completed",
  cancelled = "cancelled",
  in_cancel = "in_cancel",
  draft = "draft",
}

export const ORDER_STATUS_META: Record<EORDER_STATUS, { name: string }> = {
  [EORDER_STATUS.PENDING]: { name: "Chờ duyệt" },
  [EORDER_STATUS.pending]: { name: "Chờ đóng gói" },
  [EORDER_STATUS.packing]: { name: "Đang đóng gói" },
  [EORDER_STATUS.packed]: { name: "Chờ lấy hàng" },
  [EORDER_STATUS.shipping]: { name: "Đã giao cho ĐVVC" },
  [EORDER_STATUS.shipped]: { name: "Đã giao cho người mua" },
  [EORDER_STATUS.completed]: { name: "Hoàn thành" },
  [EORDER_STATUS.cancelled]: { name: "Huỷ" },
  [EORDER_STATUS.in_cancel]: { name: "Chờ xử lý huỷ" },
  [EORDER_STATUS.draft]: { name: "Nháp" },
};

export const STATUS_MAP: Record<
  string,
  { label: string; color: string; tooltip: string }
> = {
  pending: {
    label: "Chờ duyệt",
    color: "orange",
    tooltip: "Sản phẩm đang chờ duyệt",
  },
  approved: {
    label: "Đã duyệt",
    color: "green",
    tooltip: "Sản phẩm đã được duyệt",
  },
  rejected: {
    label: "Từ chối",
    color: "red",
    tooltip: "Sản phẩm đã bị từ chối",
  },
};

export const REQUEST_TYPE_MAP: Record<string, string> = {
  SAMPLE: "Nhận mẫu",
  SHOWCASE: "Trưng bày",
};

/** Placeholder khi giá trị null/undefined */
export const NA = "--";