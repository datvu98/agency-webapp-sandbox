import React from 'react'
import { Button, Flex, Modal, Row } from 'antd'

const ResultFinalizationDialog = ({ onHide, show, result }) => {
    return (
        <Modal open={show} aria-labelledby="example-modal-sizes-title-sm" centered
            title={'Kết quả quyết toán'}
            footer={[
                <Flex gap={20} justify='center'>
                    <Button onClick={onHide}
                        style={{ height: 40, width: 100 }}
                        type='primary'
                        color="#ff5629"
                    >
                        Đóng
                    </Button>
                </Flex>
            ]}
        >
            <Row>
                <div className="col-12 mt-3">
                    Tổng đơn hàng quyết toán :
                    <span style={{ marginLeft: 4 }}>
                        <strong>{result?.total}</strong>
                    </span>
                </div>
            </Row>
            <Row>
                <div className="col-12 mt-3">
                    Tổng đơn hàng quyết toán thành công: <span style={{ marginLeft: 4, color: '#52c41a' }}>
                        <strong>
                            {result?.total_success || 0}
                        </strong>
                    </span>
                </div>
            </Row>
            <Row>
                <div className="col-12 mt-3">
                    Tổng đơn hàng quyết toán thất bại: <span style={{ marginLeft: 4, color: '#ff4d4f' }}>
                        <strong>
                            {result?.total_fail || 0}
                        </strong>
                    </span>
                </div>
            </Row>
        </Modal>
    )
}

export default ResultFinalizationDialog