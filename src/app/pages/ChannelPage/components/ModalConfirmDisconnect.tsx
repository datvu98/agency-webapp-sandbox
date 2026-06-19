import { WarningFilled } from "@ant-design/icons";
import { Button, Checkbox, Flex, Modal, Radio, Spin, Typography } from "antd";
import React, { memo, useCallback, useState } from "react";

interface ModalConfirmDisconnectProps {
    currentStoreId: number | null,
    onConfirm: (currentStoreId: number | null) => void,
    loading: boolean,
    onHide: () => void
}

const ModalConfirmDisconnect = ({
    currentStoreId,
    onConfirm,
    loading,
    onHide
}: ModalConfirmDisconnectProps) => {

    return (
        <Modal
            title=""
            open={!!currentStoreId}
            closable={false}
            style={{ textAlign: 'center', top: '30%' }}
            footer={[
                <Flex className="w-100" align="center" gap={20} justify="center">
                    <Button
                        type="primary"
                        className="btn-base btn-cancel"
                        disabled={loading}
                        onClick={onHide}
                    >
                        Không
                    </Button>
                    <Button
                        type="primary"
                        className="btn-base"
                        loading={loading}
                        onClick={() => onConfirm(currentStoreId)}
                    >
                        Có, ngắt kết nối
                    </Button>
                </Flex>
            ]}
        >
            <Spin spinning={loading}>
                <Flex vertical align="center" justify="center" style={{ marginBottom: 20 }} gap={15}>
                    <WarningFilled style={{ color: "red", fontSize: 36 }} />
                    <Typography.Text>Bạn có chắc chắn muốn ngắt kết nối gian hàng này? UpS sẽ không thể thực hiện đồng bộ 2 chiều các thông tin liên quan gian hàng khi bạn ngắt kết nối.</Typography.Text>
                </Flex>
            </Spin>
        </Modal>
    )
};

export default memo(ModalConfirmDisconnect);