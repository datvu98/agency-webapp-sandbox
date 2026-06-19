import React from 'react'
import { Modal, Typography, Space, Button } from 'antd'
import { InfoCircleOutlined, WarningFilled } from '@ant-design/icons'

const { Text } = Typography

interface ConfirmPausePartnerAccountProps {
    open: boolean
    onCancel: () => void
    onConfirm: () => void
}

const ModalPausedAccount: React.FC<ConfirmPausePartnerAccountProps> = ({
    open,
    onCancel,
    onConfirm,
}) => {
    return (
        <Modal
            open={open}
            centered
            footer={null}
            closable={false}
            width={520}
        >
            <Space
                direction="vertical"
                size={20}
                style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '12px 8px',
                }}
            >
                {/* Icon cảnh báo */}
                <InfoCircleOutlined
                    style={{ fontSize: 48, color: '#1890ff' }}
                />

                {/* Nội dung */}
                <Text style={{ fontSize: 15, lineHeight: '22px' }}>
                    Bạn có chắc chắn muốn tạm dừng kết nối tài khoản này không?
                </Text>

                {/* Buttons */}
                <Space size={16} style={{ marginTop: 8 }}>
                    <Button onClick={onCancel} style={{ minWidth: 96 }}>
                        Huỷ
                    </Button>
                    <Button
                        onClick={onConfirm}
                        style={{ minWidth: 96 }}
                        type="primary"
                    >
                        Đồng ý
                    </Button>
                </Space>
            </Space>
        </Modal>
    )
}

export default ModalPausedAccount
