export const CONTRACT_STATUS_OPTIONS = [
    {
        label: "Chưa bắt đầu",
        value: 1,
    },
    {
        label: "Đang hoạt động",
        value: 2,
    },
    {
        label: "Đã kết thúc",
        value: 3,
    },
];

export const CONTRACT_MESSAGES = {
    ACTIVE_BLOCK: "Hợp đồng đang hoạt động, không thể thực hiện thao tác này",
    ENDED_BLOCK: "Hợp đồng đã kết thúc, không thể thực hiện thao tác này",
    CMS_ENDED_BLOCK: "Hợp đồng đã kết thúc, không thể cấu hình CMS",
    STOP_BLOCK: "Chỉ hợp đồng đang hoạt động mới được phép dừng.",
};

export const MAPPING_EVENT = {
    created: 'Tạo mới',
    updated: 'Chỉnh sửa',
    deleted: "Xóa hợp đồng "
}