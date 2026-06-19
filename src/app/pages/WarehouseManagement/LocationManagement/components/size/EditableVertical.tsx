import React, { memo, useState } from "react";
import { Popover, InputNumber, Button, Form, Space, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const EditableVertical = memo(({ text, onConfirm, id }: any) => {
	const [open, setOpen] = useState(false);
	const [form] = Form.useForm();

	const handleOpenChange = (newOpen) => {
		setOpen(newOpen);
		if (newOpen) {
			form.setFieldsValue({ ratio: text || "" });
		}
	};

	const handleConfirm = async () => {
		try {
			const values = await form.validateFields();
			onConfirm?.({ ratio: values.ratio, id }, () => setOpen(false), "ratio");
			setOpen(false);
		} catch (error) {
			// Validation failed — do nothing
		}
	};

	const content = (
		<div style={{ width: 220 }}>
			<Form form={form} layout="vertical" autoComplete="off">
				<Form.Item
					name="ratio"
					label="Tỷ lệ chuyển đổi"
					style={{
						marginBottom: 8,
					}}
					rules={[
						{ required: true, message: "Vui lòng nhập tỉ lệ chuyển đổi" },
						{
							validator: (_, value) => {
								if (value === undefined || value === null) {
									return Promise.resolve(); // bỏ qua validator nếu trống
								}
								if (value < 1 || value > 10000) {
									return Promise.reject("Tỉ lệ chuyển đổi phải nằm trong 1 - 10.000");
								}
								return Promise.resolve();
							},
						},
					]}
				>
					<InputNumber
						onKeyPress={(e) => {
							if (!/[0-9]/.test(e.key)) e.preventDefault();
						}}
						size="middle"
						style={{ width: "100%" }}
						placeholder="Nhập tỷ lệ"
						controls={false}
					/>
				</Form.Item>

				<Space style={{ justifyContent: "flex-end", width: "100%" }}>
					<Button type="primary" size="middle" icon={<CheckOutlined />} onClick={handleConfirm} />
					<Button size="middle" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
				</Space>
			</Form>
		</div>
	);

	return (
		<Popover open={open} onOpenChange={handleOpenChange} trigger="click" content={content} placement="right">
			<Typography.Text style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleOpenChange(true)}>
				{text || ""} XS
			</Typography.Text>
		</Popover>
	);
});

export default EditableVertical;
