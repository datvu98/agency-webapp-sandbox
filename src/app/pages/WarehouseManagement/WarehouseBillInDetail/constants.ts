export const PRODUCT_TYPE_OPTIONS = [
	{
		value: 0,
		label: "Sản phẩm thường",
		code: "normal_product",
	},
	{
		value: 1,
		label: "Sản phẩm có hạn sử dụng",
		code: "expire_warning_product",
	},
];

export const STATUS_TYPE = [
	{
		value: "NEW",
		label: "Trạng thái mới",
	},
	{
		value: "OTHER",
		label: "Trạng thái khác",
	},
];

export const OPTIONS_PROTOCOL = [
	{
		value: "0",
		label: "Nhập kho hoàn hàng",
	},
	{
		value: "2",
		label: "Nhập kho mua hàng",
	},
];

export const TABS = [
	{
		label: "Check-in",
		key: "check_in",
	},
	{
		label: "Phiên nhận hàng",
		key: "receive",
	},
	{
		label: "Phiên lưu kho",
		key: "put_away",
	}
];
