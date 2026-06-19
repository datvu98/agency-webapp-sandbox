export const TABS = [
	{
		label: "Chờ nhập",
		key: "waiting",
    subtabs: [
      { label: "Chưa check-in", key: "check_in", is_default: true },
      { label: "Đã check-in", key: "checked_in" },
    ],
	},
	{
		label: "Đã nhập",
		key: "complete",
    subtabs: [
      { label: "Đã nhập kho", key: "complete", is_default: true },
      { label: "Đã hoàn thành", key: "end" },
      {label: 'Chênh lệch sau nhập', key: 'dif_after_import'}
    ],
	},
	{
		label: "Đã đóng PO",
		key: "is_purchase_order_completed",
	},
	{
		label: "Đã lưu kho",
		key: "storage_import",
	},
];

export const OPTIONS_EVIDENCE = [
	{ value: '1', label: "Có thông tin chứng từ " },
	{ value: '0', label: "Chưa có thông tin chứng từ" },
];

export const OPTIONS_PROTOCOL = [
	{
		value: '0',
		label: "Nhập kho hoàn hàng",
	},
	{
		value: '2',
		label: "Nhập kho mua hàng",
	},
];

export const SEARCH_OPTIONS_BILL_IN = [
	{ value: 'created_at', label: 'Thời gian tạo', placeholder: "Thời gian tạo"},
	{ value: 'processed_at', label: 'Thời gian nhập kho', placeholder: "Thời gian nhập kho"}
];

export const SEARCH_OPTIONS = [
	{ value: 'code', label: 'Mã phiếu', placeholder: 'Nhập mã phiếu nhập kho' },
	{ value: 'order_code', label: 'Mã đơn hàng', placeholder: 'Nhập mã đơn hàng' },
	{ value: 'shipping_code', label: 'Mã vận đơn', placeholder: 'Nhập mã vận đơn' },
	{ value: 'purchase_order_code', label: 'Mã phiếu đặt hàng', placeholder: 'Nhập mã phiếu đặt hàng' }
];

export const STATUS_BILL_OPTIONS = [
	{ value: 'pending', label: 'Chưa check-in'},
	{ value: 'checked_in', label: 'Đã check-in'},
	{ value: 'receiving', label: 'Đang nhận hàng'},
	{ value: 'received', label: 'Đã nhận hàng'},
	{ value: 'purchase_order_completed', label: 'Đã đóng PO'},
	{ value: 'putting_away', label: 'Đang lưu kho'},
	{ value: 'putted_away', label: 'Đã lưu kho'},
	{ value: 'gap', label: 'Chênh lệch sau nhận hàng'},
	{ value: 'purchase_order_cancelled', label: 'Đã huỷ'},
];

export const DISCREPANCY_OPTIONS = [
	{ value: '1', label: 'Có chênh lệch'},
	{ value: '2', label: 'Không chênh lệch'}
];
