import { ScanOptionType } from "./types";

export const SCAN_OPTIONS: ScanOptionType[] = [
	{
		label: "Quét đóng gói",
		value: "packing",
		is_default: true,
	},
	{
		label: "Quét tìm kiếm",
		value: "searching",
		is_default: false,
	},
];

export const MAPPING_STATUS = {
	DOING: "Đang đóng gói",
	DONE: "Đã đóng gói",
	NEW: "Sẵn sàng đóng gói",
};
