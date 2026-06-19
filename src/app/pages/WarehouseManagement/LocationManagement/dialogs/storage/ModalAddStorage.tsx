import React, { useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Spin, Radio } from "antd";
import { useQuery, useMutation } from "@apollo/client";
import mutate_locationManagerCreate from "graphql/mutations/mutate_locationManagerCreate";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import { showAlert } from "utils/helper";
import { OPTIONS_TYPE_EQUIPMENT } from "../../constants";
import mutate_storageEquipmentCreate from "graphql/mutations/mutate_storageEquipmentCreate";
import mutate_storageEquipmentCreateBatch from "graphql/mutations/mutate_storageEquipmentCreateBatch";

const ModalAddStorage = ({ onHide, show, warehouseId }) => {
	const [form] = Form.useForm();
	const valuesForm = Form.useWatch([], { form, preserve: true }) as any;

	const [storageEquipmentCreate, { loading: loadingStorageEquipmentCreate }] = useMutation(mutate_storageEquipmentCreate, {
		awaitRefetchQueries: true,
		refetchQueries: ["storageEquipmentList"],
	});

	const [storageEquipmentCreateBatch, { loading: loadingStorageEquipmentCreateBatch }] = useMutation(mutate_storageEquipmentCreateBatch, {
		awaitRefetchQueries: true,
		refetchQueries: ["storageEquipmentList"],
	});

	// Submit handler
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (values?.mode == "manual") {
				const { data } = await storageEquipmentCreate({
					variables: {
						created: {
							code: values.code.toUpperCase(),
							warehouseId,
							containerType: values?.containerType || "tote",
							deviceType: "mobile",
						},
					},
				});

				if (data?.storageEquipmentCreate?.success) {
					showAlert.success("Tạo thiết bị chứa thành công.");
					form.resetFields();
					onHide();
				} else {
					showAlert.error(data?.storageEquipmentCreate?.message || "Tạo thiết bị chứa thất bại.");
				}
			} else {
				const { data } = await storageEquipmentCreateBatch({
					variables: {
						createdBatch: {
							warehouseId,
							containerType: values?.containerType || "tote",
							deviceType: "mobile",
							prefix: values?.prefix,
							quantity: values?.quantity,
						},
					},
				});

				if (data?.storageEquipmentCreateBatch?.success) {
					showAlert.success("Tạo thiết bị chứa thành công.");
					form.resetFields();
					onHide();
				} else {
					showAlert.error(data?.storageEquipmentCreateBatch?.message || "Tạo thiết bị chứa thất bại.");
				}
			}
		} catch (err) {
			console.log("Validation failed:", err);
		}
	};

	return (
		<Modal
			title={"Thêm thiết bị chứa"}
			open={show}
			onCancel={onHide}
			centered
			width={600}
			footer={[
				<Button key="cancel" onClick={onHide} disabled={loadingStorageEquipmentCreate || loadingStorageEquipmentCreateBatch} className="btn-base">
					Huỷ
				</Button>,
				<Button key="submit" type="primary" onClick={handleSubmit} loading={loadingStorageEquipmentCreate || loadingStorageEquipmentCreateBatch} className="btn-base">
					Tạo
				</Button>,
			]}
		>
			<Spin spinning={loadingStorageEquipmentCreate || loadingStorageEquipmentCreateBatch}>
				<Form layout="vertical" form={form} initialValues={{ containerType: "tote", mode: "manual" }}>
					<Form.Item name="containerType" label={"Loại thiết bị"} rules={[{ required: true, message: "Vui lòng chọn loại thiết bị" }]}>
						<Select options={OPTIONS_TYPE_EQUIPMENT} placeholder={"Chọn loại thiết bị"} showSearch optionFilterProp="label" size="large" />
					</Form.Item>

					<Form.Item label="" name="mode">
						<Radio.Group>
							<Radio value="manual">Thủ công</Radio>
							<Radio value="auto">Tự động tạo theo tiền tố</Radio>
						</Radio.Group>
					</Form.Item>

					{valuesForm?.mode == "manual" && (
						<Form.Item
							name="code"
							label={"Mã thiết bị"}
							rules={[
								{ required: true, message: "Vui lòng nhập mã thiết bị" },
								{ max: 50, message: "Mã thiết bị tối đa 50 ký tự" },
								{
									pattern: /^[A-Za-z0-9_]+( [A-Za-z0-9_]+)*$/,
									message:
									  "Mã thiết bị chỉ gồm chữ in hoa, số, dấu gạch dưới và dấu cách (không có khoảng trắng ở đầu/cuối)",
								},
							]}
						>
							<Input maxLength={50} size="large" placeholder={"Nhập mã thiết bị"} onChange={(e) => form.setFieldsValue({ code: e.target.value.toUpperCase() })} />
						</Form.Item>
					)}

					{valuesForm?.mode == "auto" && (
						<>
							<Form.Item
								name="prefix"
								label={"Tiền tố"}
								rules={[
									{ required: true, message: "Vui lòng nhập tiền tố" },
									{ max: 10, message: "Tiền tố tối đa 10 ký tự" },
									{
										pattern: /^[A-Za-z0-9_]+$/,
										message: "Tiền tố chỉ được chứa chữ, số và dấu gạch dưới (không dấu, không ký tự đặc biệt, không khoảng trắng)",
									},
								]}
							>
								<Input maxLength={10} size="large" placeholder={"Nhập tiền tố"} />
							</Form.Item>
							<Form.Item
								name="quantity"
								label={"Số lượng cần tạo"}
								rules={[
									{ required: true, message: "Vui lòng nhập số lượng cần tạo" },
									{
										validator: (_, value) => {
											if (value === undefined || value === null) {
												return Promise.resolve(); // bỏ qua nếu trống
											}
											if (value < 1 || value > 1000000) {
												return Promise.reject("Số lượng cần tạo phải nằm trong 1 - 1.000.000");
											}
											return Promise.resolve();
										},
									},
								]}
							>
								<InputNumber style={{ width: "100%" }} size="large" placeholder={"Số lượng cần tạo"} />
							</Form.Item>
						</>
					)}
				</Form>
			</Spin>
		</Modal>
	);
};

export default ModalAddStorage;
