import React, { memo } from "react";
import { Modal, Button } from "antd";

interface ModalConfirmProps {
	show: boolean;
	onHide: () => void;
	onConfirm: () => void;
	text: string;
}

const ModalConfirm: React.FC<ModalConfirmProps> = memo(({ show, onHide, onConfirm, text }) => {
	return (
		<Modal open={show} centered onCancel={onHide} footer={null} destroyOnClose>
			<div style={{ textAlign: "center", padding: "12px 8px" }}>
				<div style={{ marginBottom: 24 }}>{`Thông tin về ${text} sẽ bị thay đổi, bạn có đồng ý cập nhật?`}</div>

				<div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
					<Button onClick={onHide} style={{ width: 120 }} className="btn-base">
						Huỷ
					</Button>

					<Button type="primary" onClick={onConfirm} style={{ width: 120 }} className="btn-base">
						Đồng ý
					</Button>
				</div>
			</div>
		</Modal>
	);
});

export default ModalConfirm;
