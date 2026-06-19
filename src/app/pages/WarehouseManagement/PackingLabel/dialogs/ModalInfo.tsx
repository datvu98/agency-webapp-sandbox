import React, { memo } from "react";
import { Modal, Button, Flex, Typography } from "antd";

interface ModalInfoProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    dataInfo: any;
}
const {Text} = Typography

const ModalInfo: React.FC<ModalInfoProps> = memo(({ show, onHide, onConfirm, dataInfo }) => {
    return (
        <Modal open={show} centered footer={null} onCancel={onHide} destroyOnClose>
            <div style={{ textAlign: "center", padding: "12px 8px" }}>
                <Flex vertical>
                    <Text>Mã phiếu xuất:</Text>
                    <Text strong style={{color: '#d48e5b', fontSize: 16}}>{dataInfo?.warehouseBill?.code || '--'}</Text>
                    <Text>Mã đơn hàng:</Text>
                    <Text strong style={{color: '#d48e5b', fontSize: 16}}>{dataInfo?.warehouseBill?.orderCode || '--'}</Text>
                </Flex>
                <Flex justify="center">
                    <Button type="primary" className="btn-base" onClick={onConfirm}>
                        In vận đơn
                    </Button>
                </Flex>
            </div>
        </Modal>
    );
});

export default ModalInfo;
