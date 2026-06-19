import React, { useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Spin, Radio } from "antd";
import { OPTIONS_TYPE_EQUIPMENT } from "../../constants";

const ModalDetailStorage = ({ onHide, show, warehouseId, dataDetail, setShowModalConfirm }) => {
	const [form] = Form.useForm();
	const valuesForm = Form.useWatch([], { form, preserve: true }) as any;

	// Submit handler
	const initialValues = useMemo(() => {
		return {
			code: dataDetail?.code || "",
			containerType: dataDetail?.containerType || "tote",
		};
	}, [dataDetail]);
	const handleSubmit = async () => {
		const values = await form.validateFields();
		setShowModalConfirm({
			show: true,
			data: {
				id: dataDetail?.id,
				code: values?.code?.toUpperCase(),
				containerType: values?.containerType || "tote",
				type: "storage",
			},
		});
		onHide();
	};

	return (
		<Modal
			title={"Cập nhật thiết bị chứa"}
			open={show}
			onCancel={onHide}
			centered
			width={600}
			footer={[
				<Button key="cancel" onClick={onHide} className="btn-base">
					Huỷ
				</Button>,
				<Button key="submit" type="primary" onClick={handleSubmit} className="btn-base">
					Cập nhật
				</Button>,
			]}
		>
			<Spin spinning={false}>
				<Form layout="vertical" form={form} initialValues={initialValues}>
					<Form.Item name="containerType" label={"Loại thiết bị"} rules={[{ required: true, message: "Vui lòng chọn loại thiết bị" }]}>
						<Select options={OPTIONS_TYPE_EQUIPMENT} placeholder={"Chọn loại thiết bị"} showSearch optionFilterProp="label" size="large" />
					</Form.Item>

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
				</Form>
			</Spin>
		</Modal>
	);
};

export default ModalDetailStorage;
