import React, { useEffect, useMemo } from "react";
import { Modal, Form, Input, InputNumber, Button, Select } from "antd";
import { showAlert } from "utils/helper";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import { useQuery } from "@apollo/client";

interface ModalDetailAisleProps {
	show: boolean;
	onHide: () => void;
	dataDetail: any;
	warehouseId?: string | number;
	setShowModalConfirm: (value: any) => void;
}

const ModalDetailAisle: React.FC<ModalDetailAisleProps> = ({ show, onHide, warehouseId, dataDetail, setShowModalConfirm }) => {
	const [form] = Form.useForm();
	const { data: dataArea, loading: loadingDataArea } = useQuery(query_locationManagerList, {
		variables: {
			warehouseId,
			type: "area",
		},
		fetchPolicy: "cache-and-network",
	});
	const optionArea = useMemo(() => {
		if (!dataArea?.locationManagerList?.data?.length) return [];
		return dataArea?.locationManagerList?.data?.map((item) => ({
			label: item?.code,
			value: item?.id,
		}));
	}, [dataArea]);
	useEffect(() => {
		if (dataDetail) {
			form.setFieldsValue({
				code: dataDetail?.code,
				name: dataDetail?.name,
				priority: dataDetail?.priority,
				area: optionArea?.find((option) => option?.value == dataDetail?.area?.id)?.value,
			});
		}
	}, [dataDetail, form, optionArea]);

	const handleSubmit = (values: any) => {
		console.log(values);
		setShowModalConfirm({
			show: true,
			data: {
				type: "aisle",
				id: dataDetail?.id,
				name: values?.name,
				code: values?.code?.toUpperCase(),
				priority: +values?.priority || 0,
				areaId: values?.area,
			},
		});
		onHide();
	};

	return (
		<Modal open={show} onCancel={onHide} title="Cập nhật luống đi" centered destroyOnClose footer={null}>
			<Form
				form={form}
				layout="vertical"
				onFinish={handleSubmit}
				initialValues={{
					code: dataDetail?.code,
					name: dataDetail?.name,
					priority: dataDetail?.priority,
					area: optionArea?.find((option) => option?.value == dataDetail?.area?.id)?.value,
				}}
			>
				<Form.Item name="area" label={"Mã khu vực"} rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}>
					<Select options={optionArea} placeholder={"Chọn khu vực"} showSearch optionFilterProp="label" size="large" />
				</Form.Item>

				<Form.Item
					name="code"
					label={"Mã luống đi"}
					rules={[
						{ required: true, message: "Vui lòng nhập mã luống đi" },
						{ max: 50, message: "Mã luống đi tối đa 50 ký tự" },
						{
							pattern: /^[A-Za-z0-9_]+( [A-Za-z0-9_]+)*$/,
							message:
							  "Mã luống đi chỉ gồm chữ in hoa, số, dấu gạch dưới và dấu cách (không có khoảng trắng ở đầu/cuối)",
						  },
					]}
				>
					<Input maxLength={50} size="large" placeholder={"Nhập mã luống đi"} onChange={(e) => form.setFieldsValue({ code: e.target.value.toUpperCase() })} />
				</Form.Item>

				<Form.Item
					name="name"
					label={"Tên luống đi"}
					rules={[
						{ max: 125, message: "Tên luống đi tối đa 125 ký tự" },
						{
							validator: (_, value) => {
								if (!value) return Promise.resolve();
								if (value.trim().length !== value.length) return Promise.reject("Tên luống đi không được chứa dấu cách ở đầu và cuối");
								if (/\s\s+/g.test(value)) return Promise.reject("Tên luống đi không được chứa 2 dấu cách liên tiếp");
								return Promise.resolve();
							},
						},
					]}
				>
					<Input maxLength={125} size="large" placeholder={"Nhập tên luống đi"} />
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
						size="large"
						placeholder={"Nhập mức độ ưu tiên"}
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

export default ModalDetailAisle;
