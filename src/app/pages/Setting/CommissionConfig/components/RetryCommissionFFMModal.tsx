import { useMutation } from "@apollo/client";
import {
    Button,
    Col,
    Flex,
    Modal,
    Row,
    Spin,
    Typography,
    DatePicker,
} from "antd";
import dayjs from "dayjs";
import React, { memo, useState } from "react";
import mutate_vrRetryExecuteCommissionFulfillment from "graphql/mutations/mutate_vrRetryExecuteCommissionFulfillment";
import { showAlert } from "utils/helper";
import ModalConfirm from "./ModalConfirm";
import { useParams } from "react-router-dom";

const { Text } = Typography;

interface RetryCommissionModalProps {
    onHide: () => void;
    sme_id?: number;
    begin_at?: string,
    end_at?: string,
}

const RetryCommissionModal = ({ onHide, sme_id, begin_at, end_at }: RetryCommissionModalProps) => {
    const [show, setShow] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);

    const { contractId } = useParams();
    const fromDate = dayjs(begin_at);
    const toDate = dayjs(end_at);


    const [vrRetryExecuteCommissionFFM, { loading: loadingFFM }] = useMutation(
        mutate_vrRetryExecuteCommissionFulfillment,
        {
            refetchQueries: ["vrConfigCommission"],
            awaitRefetchQueries: true,
        }
    );

    const handleConfirm = async () => {

        const { data } = await vrRetryExecuteCommissionFFM({
            variables: {
                sme_id: sme_id,
                contract_id: Number(contractId),
                from_time: fromDate.unix(),
                to_time: toDate.unix(),
            },
        });
        if (data?.vrRetryExecuteCommissionFulfillment?.success) {
            showAlert.success(data?.vrRetryExecuteCommissionFulfillment?.message || "Chạy tính toán lại CMS Fulfillment thành công");
        } else {
            showAlert.error(data?.vrRetryExecuteCommissionFulfillment?.message || "Chạy tính toán lại CMS không thành công");
        }

        onHide();
    };

    return (
        <>
            {showConfirm && (
                <ModalConfirm
                    onHide={() => {
                        setShowConfirm(false);
                        setShow(true);
                    }}
                    onConfirm={handleConfirm}
                    showComfirm={showConfirm}
                />
            )}

            <Modal
                title="Chạy lại tính toán CMS"
                open={show}
                closable={false}
                style={{ top: "30%" }}
                footer={
                    <Flex className="w-100" align="center" gap={20} justify="center">
                        <Button type="primary" className="btn-base btn-cancel" onClick={onHide}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            className="btn-base"
                            onClick={() => {
                                setShowConfirm(true);
                                setShow(false);
                            }}
                            disabled={loadingFFM}
                        >
                            Chạy
                        </Button>
                    </Flex>
                }
            >
                <Spin spinning={loadingFFM}>
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
    );
};

export default memo(RetryCommissionModal);
