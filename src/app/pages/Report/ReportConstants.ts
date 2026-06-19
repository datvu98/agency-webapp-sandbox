const LABELS_TOP = [
	{ value: 100, label: "Khách hàng thêm mới" },
	{ value: 100, label: "Khách hàng tiềm năng" },
	{ value: 100, label: "Khách hàng bùm đơn" },
	{ value: 100, label: "Khách hàng giàu" },
	{ value: 100, label: "Khách hàng nghèo" },
];

const SERVICE_TYPES = [
	{ value: 1, label: "Service" },
	{ value: 2, label: "Outright" },
	{ value: 3, label: "Consignment" },
];

const CONTRACT_TYPES = [
	{ value: 1, label: "Đang hợp tác" },
	{ value: 2, label: "Tạm dừng" },
	{ value: 3, label: "Tất cả" },
];

const SOURCE_TYPES = [
	{ value: "platform", label: "Đơn từ sàn" },
	{ value: "manual", label: "Đơn thủ công" },
	{ value: "pos", label: "Đơn POS" },
	{ value: "web", label: "Đơn Web" },
	{ value: "social", label: "Đơn Social" },
];

enum DATE_RANGE_TYPE {
	HOURS = "hours",
	DAY = "day",
	WEEK = "week",
	MONTH = "month",
	YEAR = "year",
}

enum FORMAT_DATE_RANGE {
	"hours" = "HH:mm",
	"day" = "DD/MM/YYYY",
	"week" = "WW/YYYY",
	"month" = "MM/YYYY",
	"year" = "YYYY",
}

const MAX_DAYS_IN_MONTH = 31;
const MAX_DAYS_IN_WEEK = 7;
const MAX_MONTHS_IN_YEAR = 12;
const TIMESTAMP_PER_DAY = 86400;
const TIMESTAMP_PER_HOURS = 3600;
const COLOR_SHOPEE = ["#FE5629", "#FF7F00", "#FF4500", "#FF8C00", "#EE7600", "#CD6600", "#FFA500", "#EE9A00", "#FF7F50"];
const COLOR_LAZADA = ["#0a62f3", "#00008B", "#4169E1", "#4876FF", "#436EEE", "#3A5FCD", "#27408B", "#0000FF", "#0000FF", "#000080"];

export {
	LABELS_TOP,
	DATE_RANGE_TYPE,
	FORMAT_DATE_RANGE,
	MAX_DAYS_IN_MONTH,
	MAX_DAYS_IN_WEEK,
	MAX_MONTHS_IN_YEAR,
	TIMESTAMP_PER_DAY,
	TIMESTAMP_PER_HOURS,
	CONTRACT_TYPES,
	COLOR_LAZADA,
	COLOR_SHOPEE,
	SERVICE_TYPES,
	SOURCE_TYPES,
};
