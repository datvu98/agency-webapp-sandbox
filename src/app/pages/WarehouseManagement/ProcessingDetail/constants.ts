export const TABS_DETAIL = [
	{
		label: "Phiếu xuất",
		key: "package",
	},
	{
		label: "Hàng hoá",
		key: "variant",
	},
];

export const SUB_TABS = [
	{
		key: "valid",
		label: "Hợp lệ",
	},
	{
		key: "error",
		label: "Xử lý lỗi",
	},
	{
		key: "not_have_tracking_no",
		label: "Chưa có vận đơn",
	},
];

export const STATUS_BILL_OUT = [
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

const STATUS_ORDER_PACK = {
	pending: "Chờ duyệt",
	waiting_for_packing: "Chờ đóng gói",
	wait_shipping_carrier: "Chờ phân bổ ĐVVC",
	packing: "Đang đóng gói",
	packed: "Chờ lấy hàng",
	error_seller: "Khác",
	error_warehouse: "Khác",
	shipped: "Đã giao cho người mua ",
	completed: "Hoàn thành",
	cancelled: "Huỷ",
	in_cancel: "Chờ xử lý hủy",
	not_warehouse: "Khác",
	shipping: "Đã giao cho ĐVVC",
};

export const PackStatusName = (packStatus: any, statusOrder: any, isWaitShippingCarrier = false) => {
	let pack_status = 'other'

	if (statusOrder == 'PENDING') {
			pack_status = 'pending'
	}

	if (packStatus == 'pending') {
			pack_status = 'waiting_for_packing'
	}

	if (packStatus == 'packing') {
			pack_status = 'packing'
	}

	if (packStatus == 'packed') {
			pack_status = 'packed'
	}

	if (packStatus == 'shipping') {
			pack_status = 'shipping'
	}

	if (packStatus == 'shipped') {
			pack_status = 'shipped'
	}

	if (packStatus == 'completed') {
			pack_status = 'completed'
	}

	if (packStatus == 'cancelled') {
			pack_status = 'cancelled'
	}

	if (packStatus == 'in_cancel') {
			pack_status = 'in_cancel'
	}

	if (isWaitShippingCarrier) {
			pack_status = 'wait_shipping_carrier'
	}

	let status = STATUS_ORDER_PACK[pack_status];

	return { status: status, pack_status: pack_status };
};
