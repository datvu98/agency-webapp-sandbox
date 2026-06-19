import { Flex, Modal, Typography } from "antd";
import React, { memo } from "react";

const { Text } = Typography;

const ModalResult = ({ dataResults, onHide }) => {
    return (
        <Modal
            title="Kết quả thêm nhãn hội thoại"
            open={!!dataResults}
            onCancel={onHide}
            centered
            footer={false}
        >
            <Flex style={{ marginTop: 20 }} vertical gap={10}>
                <Flex gap={4}>
                    <Text>Tổng số hội thoại cần thêm nhãn:</Text>
                    <Text strong>{dataResults?.total}</Text>
                </Flex>
                <Flex gap={4}>
                    <Text>Tổng số hội thoại thêm nhãn thành công:</Text>
                    <Text type="success" strong>{dataResults?.totalSuccess}</Text>
                </Flex>
                <Flex gap={4}>
                    <Text>Tổng số hội thoại thêm nhãn thất bại:</Text>
                    <Text type="danger" strong>{dataResults?.totalError}</Text>
                </Flex>
            </Flex>
        </Modal>
    )
};

export default memo(ModalResult);