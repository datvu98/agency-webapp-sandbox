import { Button, Flex, Modal, Typography } from 'antd'
import React from 'react'

interface ModalBulkApproveProps {
    open: boolean
    onCancel: () => void
    onConfirm: () => void
    loading?: boolean
}

const { Text } = Typography;

const ModalBulkApprove = ({ open, onCancel, onConfirm, loading }: ModalBulkApproveProps) => {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title={<Text style={{ fontSize: 18, fontWeight: 600 }}>Xác nhận nhà sáng tạo tham gia chiến dịch</Text>} centered maskClosable={!loading} closable={!loading}>
            <div style={{ margin: '20px 0' }}>Tất cả sản phẩm mà nhà sáng tạo yêu cầu nhận mẫu sẽ được duyệt. Bạn có chắc chắn muốn xác nhận?</div>
            <Flex justify='flex-end' gap={10} >
                <Button type='default' onClick={onCancel} disabled={loading}>Hủy</Button>
                <Button type='primary' onClick={onConfirm} loading={loading}>Xác nhận</Button>
            </Flex>
        </Modal>);
};

export default ModalBulkApprove;