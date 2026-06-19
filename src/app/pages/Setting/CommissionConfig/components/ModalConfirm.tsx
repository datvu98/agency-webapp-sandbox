import { WarningFilled } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Button, Checkbox, Col, Flex, Modal, Radio, Row, Select, Spin, Typography } from "antd";
import dayjs from "dayjs";
import mutate_vrRetryExecuteCommission from "graphql/mutations/mutate_vrRetryExecuteCommission";
import React, { memo, useCallback, useState } from "react";
import { showAlert } from "utils/helper";

const { Text } = Typography
interface ModalConfirmProps {
    showComfirm: boolean,
    onHide: () => void,
    onConfirm: () => void,
}

const ModalConfirm = ({
    showComfirm,
    onHide,
    onConfirm
}: ModalConfirmProps) => {

    return (
        <Modal
            title={false}
            open={showComfirm}
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
                        onClick={onConfirm}
                    >
                        Đồng ý
                    </Button>
                </Flex>
            ]}
        >
            <Text style={{ textAlign: 'center' }}>Hệ thống sẽ chạy lại báo cáo Commission theo cấu hình bạn vừa thiết lập. Bạn có đồng ý tiếp tục?</Text>
        </Modal>
    )
};

export default memo(ModalConfirm);