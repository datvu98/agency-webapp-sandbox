import { WarningFilled } from "@ant-design/icons";
import { Button, Checkbox, Flex, Modal, Radio, Spin, Typography } from "antd";
import { title } from "process";
import React, { memo, useCallback, useState } from "react";

interface ModalConfirmProps {
	onConfirm: () => void;
	onHide: () => void;
	title: string;
}

const ModalConfirm = ({ onConfirm, onHide, title }: ModalConfirmProps) => {
	return (
		<Modal
			title=""
			open={true}
			closable={false}
			style={{ textAlign: "center", top: "30%" }}
			footer={[
				<Flex className="w-100" align="center" gap={20} justify="center">
					<Button type="primary" className="btn-base btn-cancel" onClick={onHide}>
						Huỷ
					</Button>
					<Button type="primary" className="btn-base" onClick={onConfirm}>
						Đồng ý
					</Button>
				</Flex>,
			]}
		>
			<Flex vertical align="center" justify="center" style={{ marginBottom: 20 }} gap={15}>
				<Typography.Text>{title}</Typography.Text>
			</Flex>
		</Modal>
	);
};

export default memo(ModalConfirm);
