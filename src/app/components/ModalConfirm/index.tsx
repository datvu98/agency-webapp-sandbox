import { WarningFilled } from "@ant-design/icons";
import { Button, Checkbox, Flex, Modal, Radio, Spin, Typography } from "antd";
import React, { memo, useCallback, useState } from "react";

interface ModalConfirmProps {
    open: boolean,
    loading: boolean,
    title: string,
    confirmTitle?: string,
    cancelTitle?: string,
    onConfirm: () => void,
    onHide: () => void
}

const ModalConfirm = ({
    open,
    onConfirm,
    loading,
    onHide,
    title,
    confirmTitle = 'Đồng ý',
    cancelTitle = 'Hủy',
}: ModalConfirmProps) => {

    return (
        <Modal
            title={false}
            open={open}
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
                        {cancelTitle}
                    </Button>
                    <Button
                        type="primary"
                        className="btn-base"
                        loading={loading}
                        onClick={onConfirm}
                    >
                        {confirmTitle}
                    </Button>
                </Flex>
            ]}
        >
            <Spin spinning={loading}>
                <Flex vertical align="center" justify="center" style={{ marginBottom: 20 }} gap={15}>
                    <WarningFilled style={{ color: "red", fontSize: 36 }} />
                    <Typography.Text>{title}</Typography.Text>
                </Flex>
            </Spin>
        </Modal>
    )
};

export default memo(ModalConfirm);