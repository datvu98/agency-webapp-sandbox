import React, { memo } from "react";
import { Modal, Button, Flex, Typography } from "antd";

interface ModalInfoProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    dataInfo: any;
}
const { Text } = Typography

const ModalInfo: React.FC<ModalInfoProps> = memo(({ show, onHide, onConfirm, dataInfo }) => {
    return (
        <Modal open={show} centered footer={null} onCancel={onHide} destroyOnClose>
            <div style={{ textAlign: "center", padding: "12px 8px" }}>
                <Text>Hiện có {dataInfo?.length} kiện hàng bị huỷ khi đang bàn giao. Hệ thống sẽ loại bỏ những kiện này ra khỏi danh sách và biên bản bàn giao. Bạn lưu ý không giao kiện này cho ĐVVC</Text>
                <Flex vertical gap={10}>
                    {dataInfo?.map(item => {
                        return <Text>{item?.systemPackageNumber}</Text>
                    })}
                </Flex>
            </div>
            <Flex justify="center">
                <Button type="primary" className="btn-base" onClick={onConfirm}>
                    Chấp nhận
                </Button>
            </Flex>
        </Modal>
    );
});

export default ModalInfo;
