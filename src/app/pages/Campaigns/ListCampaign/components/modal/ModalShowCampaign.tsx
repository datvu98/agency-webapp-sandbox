import { Button, Divider, Flex, Modal, Typography } from 'antd'
import React from 'react'

interface ModalShowCampaignProps {
    show: boolean
    onHide: () => void
    onConfirm: () => void
    checked: boolean
}

const { Text } = Typography;

const ModalShowCampaign = ({ show, onHide, checked, onConfirm }: ModalShowCampaignProps) => {
    return (
        <Modal
            title="Hiển thị chiến dịch với nhà sáng tạo"
            open={show}
            onCancel={onHide}
            footer={
                <Flex justify="flex-end" gap={16}>
                    <Button onClick={onHide}>Hủy</Button>
                    <Button type="primary" onClick={onConfirm}>Xác nhận</Button>
                </Flex>
            }
            centered
            width={600}
        >
            <Divider style={{ marginBottom: '20px' }} />
            <Flex vertical gap={16}>
                {checked ?
                    <Text>Bạn có chắc chắn muốn hiển thị chiến dịch này với nhà sáng tạo?</Text>
                    : <Text>Hành động này sẽ ẩn chiến dịch với nhà sáng tạo ngay lập tức. Bạn có chắc chắn muốn Tắt hiển thị chiến dịch với nhà sáng tạo?</Text>}
            </Flex>
            <Divider style={{ marginBottom: '20px' }} />
        </Modal>
    )
}

export default ModalShowCampaign