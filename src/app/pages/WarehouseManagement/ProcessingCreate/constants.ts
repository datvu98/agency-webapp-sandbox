export const OPTIONS_CONFIG_PICKUP = [
	{
		value: "grp",
		label: "Gom phiếu xuất",
		tooltip: "Hệ thống sẽ chia thành 2 loại danh sách gồm phiếu có 1 sản phẩm và phiếu có nhiều sản phẩm",
		subOptions: [
			{ value: "sio", label: "Phiếu xuất có 1 sản phẩm" },
			{ value: "mio", label: "Phiếu xuất có nhiều sản phẩm" },
		],
	},
	// {
	// 	value: "pts",
	// 	label: "Phiếu hỗn hợp (1 và nhiều sản phẩm)",
	// 	tooltip: "Danh sách được tạo sẽ gồm tất cả các phiếu xuất",
	// },
];

export const OPTIONS_FILTER_PICKUP = [
	{
		value: "orderCode",
		label: "Mã đơn hàng",
		placeholder: "Nhập mã đơn hàng, cách nhau bởi dấu phẩy",
	},
	{
		value: "code",
		label: "Mã phiếu xuất",
		placeholder: "Nhập mã phiếu xuất, cách nhau bởi dấu phẩy",
	},
	{
		value: "warehouseBillItem.variant.sku",
		label: "SKU hàng hóa kho",
		placeholder: "Nhập SKU hàng hóa kho, cách nhau bởi dấu phẩy",
	},
	{
		value: "channelCode",
		label: "Sàn",
		placeholder: "Tất cả",
	},
	{
		value: "storeId",
		label: "Gian hàng",
		placeholder: "Tất cả",
	},
	{
		value: "shippingCarrier",
		label: "ĐVVC",
		placeholder: "Tất cả",
	},
	{
		value: "shipExpiredAt",
		label: "Hạn xử lý",
		placeholder: "Chọn hạn xử lý",
	},
	{
		value: "type",
		label: "Loại phiếu",
		placeholder: "Chọn loại phiếu",
	},
	{
		value: "protocol",
		label: "Hình thức xuất kho",
		placeholder: "Chọn hình thức xuất kho",
	},
	{
		value: "milestone",
		label: "Theo mốc hạn",
		placeholder: "Chọn loại mốc hạn",
	},
];
export const OPTIONS_ORDER_BY = [
	{
		value: "orderAt",
		label: "Thời gian đặt hàng",
	},
	{
		value: "createdAt",
		label: "Thời gian tạo phiếu",
	},
	{
		value: "shipExpiredAt",
		label: "Hạn giao hàng",
	},
];

export const OPTION_TYPE_PACKAGE = [
	{
		value: 1,
		label: "Phiếu xuất có 1 sản phẩm",
	},
	{
		value: 2,
		label: "Phiếu xuất có nhiều sản phẩm",
	},
];

export const OPTIONS_PROTOCOL = [
	{
		value: 0,
		label: "Xuất kho bán hàng",
	},
	{
		value: 1,
		label: "Xuất kho thủ công",
	},
	{
		value: 2,
		label: "Xuất kho chuyển kho",
	},
];

export const OPTIONS_FILTER_MILESTONE = [
	{
		value: "in_sla_6h",
		label: "Còn hạn: N < 6h",
	},
	{
		value: "in_sla_6h_9h",
		label: "Còn hạn: 6h <= N < 9h",
	},
	{
		value: "in_sla_9h_12h",
		label: "Còn hạn: 9h <= N < 12h",
	},
	{
		value: "in_sla_over_12h",
		label: "Còn hạn: 12h <= N < 24h",
	},
	{
		value: "in_sla_over_1d_2d",
		label: "Còn hạn: 24h <= N < 2 ngày",
	},
	{
		value: "in_sla_over_2d_3d",
		label: "Còn hạn: 2 ngày <= N < 3 ngày",
	},
	{
		value: "in_sla_over_3d",
		label: "Còn hạn: N >= 3 ngày",
	},
	{
		value: "out_sla_6h",
		label: "Trễ hạn: M < 6h",
	},
	{
		value: "out_sla_6h_9h",
		label: "Trễ hạn: 6h <= M < 9h",
	},
	{
		value: "out_sla_9h_12h",
		label: "Trễ hạn: 9h <= M < 12h",
	},
	{
		value: "out_sla_over_12h",
		label: "Trễ hạn: 12h <= M < 24h",
	},
	{
		value: "out_sla_over_1d_2d",
		label: "Trễ hạn: 24h <= M < 2 ngày",
	},
	{
		value: "out_sla_over_2d_3d",
		label: "Trễ hạn: 2 ngày <= M < 3 ngày",
	},
	{
		value: "out_sla_over_3d",
		label: "Trễ hạn: M >= 3 ngày",
	},
];
