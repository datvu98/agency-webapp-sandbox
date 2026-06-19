import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";
import { showAlert } from "utils/helper";

interface ModalDetailAreaProps {
	show: boolean;
	onHide: () => void;
	dataDetail: any;
	setShowModalConfirm: (value: any) => void;
}

const ModalDetailArea: React.FC<ModalDetailAreaProps> = ({ show, onHide, dataDetail, setShowModalConfirm }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (dataDetail) {
			form.setFieldsValue({
				code: dataDetail?.code,
				name: dataDetail?.name,
				priority: dataDetail?.priority,
			});
		}
	}, [dataDetail, form]);

	const handleSubmit = (values: any) => {
		setShowModalConfirm({
			show: true,
			data: {
				type: "area",
				id: dataDetail?.id,
				name: values?.name,
				code: values?.code?.toUpperCase(),
				priority: +values?.priority || 1,
			},
		});
		onHide();
	};

	return (
		<Modal open={show} onCancel={onHide} title="Cập nhật khu vực" centered destroyOnClose footer={null}>
			<Form
				form={form}
				layout="vertical"
				onFinish={handleSubmit}
				initialValues={{
					code: dataDetail?.code,
					name: dataDetail?.name,
					priority: dataDetail?.priority,
				}}
			>
				<Form.Item
					name="code"
					label="Mã khu vực"
					rules={[
						{ required: true, message: "Vui lòng nhập mã khu vực" },
						{ max: 50, message: "Mã khu vực tối đa 50 ký tự" },
						{
							pattern: /^[A-Za-z0-9_]+( [A-Za-z0-9_]+)*$/,
							message:
							  "Mã khu vực chỉ gồm chữ in hoa, số, dấu gạch dưới và dấu cách (không có khoảng trắng ở đầu/cuối)",
						},
					]}
				>
					<Input
						maxLength={50}
						size="large"
						placeholder="Nhập mã khu vực"
						onChange={(e) => {
							form.setFieldsValue({
								code: e.target.value.toUpperCase(),
							});
						}}
					/>
				</Form.Item>

				<Form.Item
					name="name"
					label="Tên khu vực"
					rules={[
						{ max: 125, message: "Tên khu vực tối đa 125 ký tự" },
						{
							validator: (_, value) => {
								if (!value) return Promise.resolve();
								if (value.trim().length !== value.length) {
									return Promise.reject("Tên khu vực không được có dấu cách ở đầu hoặc cuối");
								}
								if (/\s\s+/g.test(value)) {
									return Promise.reject("Tên khu vực không được có 2 dấu cách liên tiếp");
								}
								return Promise.resolve();
							},
						},
					]}
				>
					<Input maxLength={125} placeholder="Nhập tên khu vực" size="large" />
				</Form.Item>

				<Form.Item
					name="priority"
					label="Mức độ ưu tiên"
					rules={[
						{ required: true, message: "Vui lòng nhập mức độ ưu tiên" },
						{
							type: "number",
							min: 1,
							max: 100000000,
							message: "Mức độ ưu tiên phải trong khoảng 1 - 100.000.000",
						},
					]}
				>
					<InputNumber
						onKeyPress={(e) => {
							if (!/[0-9]/.test(e.key)) e.preventDefault();
						}}
						style={{ width: "100%" }}
						placeholder="Nhập mức độ ưu tiên"
						size="large"
					/>
				</Form.Item>

				<Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
					<Button style={{ marginRight: 8, width: 100 }} onClick={onHide} className="btn-base">
						Huỷ
					</Button>
					<Button type="primary" htmlType="submit" style={{ width: 100 }} className="btn-base">
						Cập nhật
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ModalDetailArea;
