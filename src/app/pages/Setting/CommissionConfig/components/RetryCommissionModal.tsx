import { WarningFilled } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Button, Checkbox, Col, Flex, Modal, Radio, Row, Select, Spin, Typography, DatePicker } from "antd";
import dayjs from "dayjs";
import mutate_vrRetryExecuteCommission from "graphql/mutations/mutate_vrRetryExecuteCommission";
import React, { memo, useCallback, useState } from "react";
import { showAlert } from "utils/helper";
import ModalConfirm from "./ModalConfirm";
import { useParams } from "react-router-dom";

const { Text } = Typography
interface RetryCommissionModalProps {
    onHide: () => void,
    sme_id?: number,
    begin_at?: string,
    end_at?: string,
}

const RetryCommissionModal = ({
    onHide,
    sme_id,
    begin_at,
    end_at
}: RetryCommissionModalProps) => {

    const [show, setShow] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);

    const { contractId } = useParams();
    const fromDate = dayjs(begin_at);
    const toDate = dayjs(end_at);

    const [vrRetryExecuteCommission, { loading }] = useMutation(mutate_vrRetryExecuteCommission, {
        refetchQueries: ['vrConfigCommission'],
        awaitRefetchQueries: true
    })

    return (
        <>
            {showConfirm && <ModalConfirm onHide={() => {
                setShowConfirm(false)
                setShow(true)
            }}
                onConfirm={async () => {
                    let { data } = await vrRetryExecuteCommission({
                        variables: {
                            contract_id: Number(contractId),
                            sme_id: sme_id,
                            from_time: fromDate.unix(),
                            to_time: toDate.unix(),
                        }
                    })
                    if (data?.vrRetryExecuteCommission?.success) {
                        showAlert.success(data?.vrRetryExecuteCommissionFulfillment?.message || 'Chạy tính toán lại CMS thành công')
                        onHide()
                    } else {
                        showAlert.error(data?.vrRetryExecuteCommission?.message || 'Chạy tính toán lại CMS không thành công')
                        onHide()
                    }
                }}
                showComfirm={showConfirm}
            />}
            <Modal
                title="Chạy lại tính toán CMS"
                open={show}
                closable={false}
                style={{ top: '30%' }}
                footer={[
                    <Flex className="w-100" align="center" gap={20} justify="center">
                        <Button
                            type="primary"
                            className="btn-base btn-cancel"
                            onClick={onHide}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            className="btn-base"
                            onClick={() => {
                                setShowConfirm(true)
                                setShow(false)
                            }}
                            disabled={loading}
                        >
                            Chạy
                        </Button>
                    </Flex>
                ]}
            >
                <Spin spinning={loading}>
                    <Row gutter={20}>
                        <Col span={12}>
                            <Text strong>Thời gian bắt đầu hợp đồng</Text>
                            <DatePicker
                                showTime
                                value={fromDate}
                                disabled
                                format="DD/MM/YYYY HH:mm:ss"
                                className="w-100"
                            />
                        </Col>

                        <Col span={12}>
                            <Text strong>Thời gian kết thúc hợp đồng</Text>
                            <DatePicker
                                showTime
                                value={toDate}
                                disabled
                                format="DD/MM/YYYY HH:mm:ss"
                                className="w-100"
                            />
                        </Col>
                    </Row>
                </Spin>
            </Modal>
        </>
    )
};

export default memo(RetryCommissionModal);