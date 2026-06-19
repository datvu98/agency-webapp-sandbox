import { Button, Flex, Modal, Row, Table } from "antd";
import React, { useState } from "react";
import { SettlementWrapper } from "../Settlement.style";

export const ResultImportFileDialog = ({ dataProcessed, onHide }) => {

    const [page, setPage] = useState(1);

    let totalRecord = dataProcessed?.list_error?.length || 0;

    let totalPage = Math.ceil(totalRecord / 5);


    return (
        <SettlementWrapper>
            <Modal open={!!dataProcessed}
                centered
                onCancel={() => {
                    onHide()
                }}
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
                title={'Kết quả xử lý'}
            >
                <Row>
                    Tổng đơn hàng cần xử lý :
                    <span className="font-weight-bold">
                        <strong>{dataProcessed.total}</strong>
                    </span>
                </Row>
                <Row>
                    Tổng đơn hàng xử lý thành công: <span style={{ marginLeft: 4, color: '#52c41a' }}>
                        <strong>
                            {(+dataProcessed.total - +dataProcessed.total_error) || 0}
                        </strong>
                    </span>
                </Row>
                <Row>
                    Tổng đơn hàng xử lý thất bại: <span style={{ marginLeft: 4, color: '#ff4d4f' }}><strong>{+dataProcessed.total_error || 0}</strong></span>
                </Row>

                {!!dataProcessed?.list_error?.length && (
                    <table style={{ width: '100%' }}>
                        <thead style={{
                            borderRight: "1px solid #d9d9d9",
                            borderLeft: "1px solid #d9d9d9",
                        }}>
                            <tr className="font-size-lg">
                                <th style={{ fontSize: "14px", width: '50%' }} >
                                    Mã đơn hàng
                                </th>
                                <th style={{ fontSize: "14px", width: '50%' }}>
                                    Lỗi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataProcessed && dataProcessed?.list_error?.map(list => (
                                <tr key={`${list?.ref_order_id}`}>
                                    <td style={{ textAlign: 'center' }}>{list?.ref_order_id}</td>
                                    <td style={{ wordBreak: "break-word", textAlign: 'center' }}>{list?.error_msg}</td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                )}
            </Modal>
        </SettlementWrapper>
    );
};
