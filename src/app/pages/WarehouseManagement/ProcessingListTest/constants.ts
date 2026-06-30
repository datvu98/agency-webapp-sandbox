export const TABS = [
	{
		label: "Tất cả",
		key: "all",
	},
	{
		label: "Mới",
		key: "NEW",
	},
	{
		label: "Đã tạo lộ trình",
		key: "PICK_STEP_CREATED",
	},
	{
		label: "Sẵn sàng lấy hàng",
		key: "READY_PICKUP",
	},
	{
		label: "Đang lấy hàng",
		key: "PICKING",
	},
	{
		label: "Lấy hàng 1 phần",
		key: "PARTIALLY_PICKED",
	},
	{
		label: "Đã lấy hàng",
		key: "PICKED",
	},
	{
		label: "Huỷ",
		key: "CANCELLED",
	},
];

export const OPTIONS_TYPE_PICKUP = {
	MIO: "Nhiều sản phẩm",
	SIO: "Một sản phẩm",
	// PTS: "Hỗn hợp",
};

export const STATUS_PICKUP = {
	'NEW': 'Mới',
	'PICK_STEP_CREATED': 'Đã tạo lộ trình',
	'READY_PICKUP': 'Sẵn sàng lấy hàng',
	'PICKING': 'Đang lấy hàng',
	'PARTIALLY_PICKED': 'Lấy hàng 1 phần',
	'PICKED': 'Đã lấy hàng',
	'CANCELLED': 'Đã huỷ',
};
