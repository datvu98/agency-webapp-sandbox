export const STATUS_TABS = [
  { key: "new", label: "Chờ duyệt" },
  { key: "approved", label: "Chờ kiểm kê" },
  { key: "counting", label: "Đang kiểm kê" },
  { key: "counted", label: "Chờ xác nhận" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Huỷ" },
];

export const COUNTING_SUB_TABS = [
  { key: "1", label: "Kiểm kê lần 1" },
  { key: "2", label: "Kiểm kê lần 2" },
  { key: "3", label: "Kiểm kê lần 3" },
];

export const DEFAULT_LIMIT = 25;
export const DEFAULT_TAB = "new";
export const DEFAULT_SUB_TAB = "1";

export const TYPE_IMPORT_OPTIONS = [
  { value: "location_code", label: "Theo vị trí" },
  { value: "sku", label: "Theo SKU hàng hoá" },
];

export const TEMPLATE_LINKS: Record<string, string> = {
  location: "https://prod-statics.s3.ap-southeast-1.amazonaws.com/template/inventory_record_import_location.xlsx",
  sku: "https://prod-statics.s3.ap-southeast-1.amazonaws.com/template/inventory_record_import_sku.xlsx",
};
