import React from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";
import { useMutation } from "@apollo/client";
import { showAlert } from "utils/helper";
import mutate_locationManagerCreate from "graphql/mutations/mutate_locationManagerCreate";

interface ModalAddAreaProps {
	show: boolean;
	onHide: () => void;
	warehouseId: number | string;
}

const ModalAddArea: React.FC<ModalAddAreaProps> = ({ show, onHide, warehouseId }) => {
	const [form] = Form.useForm();

	const [locationManagerCreate, { loading }] = useMutation(mutate_locationManagerCreate, {
		awaitRefetchQueries: true,
		refetchQueries: ["locationManagerList"],
	});

	const handleSubmit = async (values: any) => {
		try {
			const { data } = await locationManagerCreate({
				variables: {
					created: {
						code: values.code.toUpperCase(),
						name: values.name?.trim(),
						priority: Number(values.priority),
						type: "area",
						warehouseId,
					},
				},
			});

			if (data?.locationManagerCreate?.success) {
				showAlert.success("Tạo khu vực thành công.");
				onHide();
				form.resetFields();
			} else {
				showAlert.error(data?.locationManagerCreate?.message || "Tạo khu vực thất bại.");
			}
		} catch (err) {
			showAlert.error("Đã xảy ra lỗi khi tạo khu vực.");
		}
	};

	return (
		<Modal open={show} onCancel={onHide} title={"Thêm mới khu vực"} footer={null} centered destroyOnClose>
			<Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{}}>
				<Form.Item
					name="code"
					label={"Mã khu vực"}
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
					<Input size="large" maxLength={50} placeholder={"Nhập mã khu vực"} onChange={(e) => form.setFieldsValue({ code: e.target.value.toUpperCase() })} />
				</Form.Item>

				<Form.Item
					name="name"
					label={"Tên khu vực"}
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
					<Input maxLength={125} placeholder={"Nhập tên khu vực"} size="large" />
				</Form.Item>

				<Form.Item
					name="priority"
					label={"Mức độ ưu tiên"}
					rules={[
						{ required: true, message: "Vui lòng nhập mức độ ưu tiên" },
						{
							validator: (_, value) => {
								if (value === undefined || value === null) {
									return Promise.resolve(); // bỏ qua validator nếu trống
								}
								if (value < 1 || value > 100000000) {
									return Promise.reject("Mức độ ưu tiên phải nằm trong 1 - 100.000.000");
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
						style={{ width: "100%" }}
						placeholder={"Nhập mức độ ưu tiên"}
						size="large"
					/>
				</Form.Item>

				<Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
					<Button style={{ marginRight: 8, width: 100 }} className="btn-base" onClick={onHide} disabled={loading}>
						Huỷ
					</Button>
					<Button type="primary" htmlType="submit" className="btn-base" loading={loading} style={{ width: 100 }}>
						Tạo
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ModalAddArea;
