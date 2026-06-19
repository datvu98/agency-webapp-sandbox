export const SEARCH_OPTIONS_BILL_OUT = [
    {
        value: "created_at",
        label: "Thời gian tạo",
        placeholder: "Thời gian tạo",
    },
    {
        value: "processed_at",
        label: "Thời gian xuất kho",
        placeholder: "Thời gian xuất kho",
    },
];

export const STATUS_BILL_OUT_OPTIONS = [
    { value: "pending", label: "Mới" },
    { value: "processing_list_added", label: "Mới tạo danh sách" },
    { value: "pick_step_created", label: "Đã tạo lộ trình" },
    { value: "pick_ready", label: "Sẵn sàng lấy hàng" },
    { value: "picking", label: "Đang lấy hàng" },
    { value: "pack_ready", label: "Sẵn sàng đóng gói" },
    { value: "packing", label: "Đang đóng gói" },
    { value: "handover_ready", label: "Sẵn sàng bàn giao" },
    { value: "handing_over", label: "Đang bàn giao" },
    { value: "handed_over", label: "Đã bàn giao" },
    { value: "cancelled", label: "Đã huỷ" },
    { value: "shipping", label: "Đang giao hàng" },
    { value: "completed", label: "Đơn hoàn thành" },
    { value: "returning", label: "Đang hoàn về" },
    { value: "return_pending", label: "Chờ xử lý trả hàng" },
    { value: "returned", label: "Đã xử lý trả hàng" },
];

export const SEARCH_OPTIONS = [
    {
        value: "code",
        label: "Mã phiếu",
        placeholder: "Nhập mã phiếu",
    },
    {
        value: "order_code",
        label: "Mã đơn hàng",
        placeholder: "Nhập mã đơn hàng",
    },
    {
        value: "shipping_code",
        label: "Mã vận đơn đơn hàng",
        placeholder: "Nhập mã vận đơn đơn hàng",
    },
    {
        value: "return_order_code",
        label: "Mã trả hàng",
        placeholder: "Nhập mã trả hàng",
    },
    {
        value: "return_tracking_number",
        label: "Mã vận đơn đơn hoàn trả",
        placeholder: "Nhập mã vận đơn đơn hoàn trả",
    },
];

export const OPTIONS_PROTOCOL_OUT = [
    {
        value: '0',
        label: 'Xuất kho bán hàng',
    },
    {
        value: '1',
        label: 'Xuất kho thủ công',

    },
    {
        value: '2',
        label: 'Xuất kho chuyển kho',
    },
];
