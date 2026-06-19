import React, { memo } from "react";
import { Modal, Table, Typography, Button } from "antd";

const { Title, Text } = Typography;

interface ModalSessionInfoProps {
    open: boolean;
    handoverLists: any[];
    onClose: () => void;
}

const columns = [
    {
        title: "Mã phiếu",
        dataIndex: "code",
        key: "code",
    },
    {
        title: "Đơn vị vận chuyển",
        dataIndex: "shippingCarrier",
        key: "shippingCarrier",
    },
    {
        title: "Tổng số kiện",
        dataIndex: "totalItems",
        key: "totalItems",
    },
];

const ModalSessionInfo: React.FC<ModalSessionInfoProps> = ({ open, handoverLists, onClose }) => {
    return (
        <Modal open={open} centered width={600} footer={null} closable={false}>
            <Title level={4} style={{ color: "#0F2B56", marginBottom: 16 }}>
                Hệ thống đã tạo {handoverLists?.length} phiếu bàn giao
            </Title>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={handoverLists ?? []}
                pagination={false}
                bordered
                size="middle"
            />

            <Text type="secondary" style={{ display: "block", marginTop: 12 }}>
                Vui lòng sang màn Bàn giao xuất hàng để kiểm tra thêm thông tin
            </Text>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <Button type="primary" onClick={onClose}>
                    Đóng
                </Button>
            </div>
        </Modal>
    );
};

export default memo(ModalSessionInfo);
