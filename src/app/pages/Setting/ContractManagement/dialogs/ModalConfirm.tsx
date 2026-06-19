import React from "react";
import { Modal, Button, Space } from "antd";

const ModalConfirm = ({
    open,
    title = "Xác nhận",
    content = "Bạn có chắc chắn muốn thực hiện hành động này?",
    onCancel,
    onOk,
    loading = false,
}) => {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            centered
            footer={null}
            title={title}
            width={420}
            destroyOnClose
        >
            <div style={{ marginTop: 12 }}>{content}</div>

            <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: 24 }}>
                <Button onClick={onCancel}>Hủy bỏ</Button>
                <Button type="primary" onClick={onOk} loading={loading}>
                    Đồng ý
                </Button>
            </Space>
        </Modal>
    );
};

export default ModalConfirm;
