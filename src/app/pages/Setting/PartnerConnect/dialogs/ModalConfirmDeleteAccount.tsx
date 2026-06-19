import React from 'react'
import { Modal, Typography, Space, Button } from 'antd'
import { WarningFilled } from '@ant-design/icons'

const { Text } = Typography

interface ConfirmDeletePartnerAccountProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

const ConfirmDeletePartnerAccount: React.FC<ConfirmDeletePartnerAccountProps> = ({
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
        <WarningFilled
          style={{ fontSize: 48, color: '#ff4d4f' }}
        />

        {/* Nội dung */}
        <Text style={{ fontSize: 15, lineHeight: '22px' }}>
          Sau khi Xóa tài khoản khỏi Agency thì hệ thống sẽ không hiển thị
          các chiến dịch được tạo bởi tài khoản này nữa.
          Bạn có muốn xóa tài khoản?
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

export default ConfirmDeletePartnerAccount
