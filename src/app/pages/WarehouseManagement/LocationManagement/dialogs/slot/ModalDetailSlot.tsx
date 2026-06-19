import React, { useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, Tooltip, Row, Col, Button, Space } from "antd";
import { useQuery, useMutation } from "@apollo/client";
import { InfoCircleOutlined } from "@ant-design/icons";
import mutate_locationManagerCreate from "graphql/mutations/mutate_locationManagerCreate";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import { showAlert } from "utils/helper";

const ModalDetailSlot = ({ onHide, show, warehouseId, dataDetail, setShowModalConfirm }) => {
	const [form] = Form.useForm();
	const valuesForm = Form.useWatch([], { form, preserve: true }) as any;

	const { data: dataArea, loading: loadingArea } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "area", isActive: true },
		fetchPolicy: "cache-and-network",
	});
	const { data: dataRack, loading: loadingRack } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "rack", isActive: true },
		fetchPolicy: "cache-and-network",
	});
	const { data: dataLevel, loading: loadingLevel } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "level", isActive: true },
		fetchPolicy: "cache-and-network",
	});

	const optionArea = useMemo(
		() =>
			dataArea?.locationManagerList?.data?.map((i) => ({
				label: i.code,
				value: i.id,
			})) || [],
		[dataArea]
	);

	const optionRack = useMemo(
		() =>
			dataRack?.locationManagerList?.data?.map((i) => ({
				label: i.code,
				value: i.id,
				areaId: i.area?.id,
			})) || [],
		[dataRack]
	);

	const optionLevel = useMemo(
		() =>
			dataLevel?.locationManagerList?.data?.map((i) => ({
				label: i.code,
				value: i.id,
				areaId: i.area?.id,
			})) || [],
		[dataLevel]
	);

	const selectedArea = Form.useWatch("area", form);

	const filteredRack = useMemo(() => {
		if (!selectedArea) return [];
		return optionRack.filter((r) => r.areaId === selectedArea);
	}, [selectedArea, optionRack]);

	const filteredLevel = useMemo(() => {
		if (!selectedArea) return [];
		return optionLevel.filter((l) => l.areaId === selectedArea);
	}, [selectedArea, optionLevel]);

	const initialValues = useMemo(() => {
		return {
			name: dataDetail?.name || "",
			code: dataDetail?.code || "",
			priority: dataDetail?.priority || "",
			area: dataDetail?.area?.id,
			rack: dataDetail?.rack?.id,
			level: dataDetail?.level?.id,
			length: dataDetail?.storageEquipment?.length,
			width: dataDetail?.storageEquipment?.width,
			height: dataDetail?.storageEquipment?.height,
			quantity: dataDetail?.storageEquipment?.maxCapacity,
		};
	}, [dataDetail]);

	// Handle submit
	const handleSubmit = async (values) => {
		setShowModalConfirm({
			show: true,
			data: {
				type: "slot",
				areaId: values?.area,
				rackId: values?.rack,
				levelId: values?.floor,
				id: dataDetail?.id,
				name: values?.name,
				code: values?.code?.toUpperCase(),
				priority: +values?.priority || 0,
				length: +values?.length || null,
				width: +values?.width || null,
				height: +values?.height || null,
				maxCapacity: +values?.quantity,
			},
		});
		onHide();
	};

	return (
		<Modal open={show} onCancel={onHide} title="Cập nhật vị trí" centered width={900} footer={null} destroyOnClose>
			<Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={initialValues}>
				<Row gutter={16}>
					<Col span={8}>
						<Form.Item name="area" label="Mã khu vực" rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}>
							<Select
								placeholder="Chọn khu vực"
								options={optionArea}
								loading={loadingArea}
								size="large"
								onChange={() => {
									form.setFieldsValue({ rack: undefined, level: undefined });
								}}
							/>
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item name="rack" label="Mã kệ" rules={[{ required: true, message: "Vui lòng chọn kệ" }]}>
							<Select placeholder="Chọn kệ" options={filteredRack} loading={loadingRack} size="large" />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item name="level" label="Mã tầng" rules={[{ required: true, message: "Vui lòng chọn tầng" }]}>
							<Select placeholder="Chọn tầng" options={filteredLevel} loading={loadingLevel} size="large" />
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col span={8}>
						<Form.Item
							name="code"
							label="Mã vị trí"
							rules={[
								{ required: true, message: "Vui lòng nhập mã vị trí" },
								{ max: 50, message: "Tối đa 50 ký tự" },
								{
									pattern: /^[A-Za-z0-9_]+( [A-Za-z0-9_]+)*$/,
									message:
									  "Mã vị trí chỉ gồm chữ in hoa, số, dấu gạch dưới và dấu cách (không có khoảng trắng ở đầu/cuối)",
								},
							]}
						>
							<Input placeholder="Nhập mã vị trí" size="large" onChange={(e) => form.setFieldsValue({ code: e.target.value.toUpperCase() })} />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item name="name" label="Tên vị trí">
							<Input placeholder="Nhập tên vị trí" maxLength={125} size="large" />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							name="priority"
							label="Mức độ ưu tiên"
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
								className="w-100"
								placeholder="Nhập mức độ ưu tiên"
								size="large"
							/>
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col span={8}>
						<Form.Item
							name="length"
							label="Chiều dài (cm)"
							rules={[
								{
									validator: (_, value) => {
										if (value === undefined || value === null) {
											return Promise.resolve(); // bỏ qua validator nếu trống
										}
										if (value < 1 || value > 100000000) {
											return Promise.reject("Chiều dài phải nằm trong 1 - 1.000.000");
										}
										return Promise.resolve();
									},
								},
							]}
						>
							<InputNumber
								className="w-100"
								placeholder="Nhập chiều dài"
								size="large"
								onKeyPress={(e) => {
									if (!/[0-9]/.test(e.key)) e.preventDefault();
								}}
							/>
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							name="width"
							label="Chiều rộng (cm)"
							rules={[
								{
									validator: (_, value) => {
										if (value === undefined || value === null) {
											return Promise.resolve(); // bỏ qua validator nếu trống
										}
										if (value < 1 || value > 100000000) {
											return Promise.reject("Chiều rộng phải nằm trong 1 - 1.000.000");
										}
										return Promise.resolve();
									},
								},
							]}
						>
							<InputNumber
								className="w-100"
								placeholder="Nhập chiều rộng"
								size="large"
								onKeyPress={(e) => {
									if (!/[0-9]/.test(e.key)) e.preventDefault();
								}}
							/>
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							name="height"
							label="Chiều cao (cm)"
							rules={[
								{
									validator: (_, value) => {
										if (value === undefined || value === null) {
											return Promise.resolve(); // bỏ qua validator nếu trống
										}
										if (value < 1 || value > 100000000) {
											return Promise.reject("Chiều cao phải nằm trong 1 - 1.000.000");
										}
										return Promise.resolve();
									},
								},
							]}
						>
							<InputNumber
								className="w-100"
								placeholder="Nhập chiều cao"
								size="large"
								onKeyPress={(e) => {
									if (!/[0-9]/.test(e.key)) e.preventDefault();
								}}
							/>
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col span={8}>
						<Form.Item
							name="quantity"
							label={
								<span>
									Số lượng chứa tối đa&nbsp;
									<Tooltip title="Số lượng chứa tối đa được tính trên size nhỏ nhất là XS">
										<InfoCircleOutlined />
									</Tooltip>
								</span>
							}
							rules={[
								{ required: true, message: "Vui lòng nhập số lượng chứa tối đa" },
								{
									type: "number",
									min: 1,
									max: 1000000,
									message: "Giá trị từ 1 đến 1.000.000",
								},
							]}
						>
							<InputNumber className="w-100" placeholder="Nhập số lượng chứa tối đa" size="large" />
						</Form.Item>
					</Col>
				</Row>

				<Space style={{ width: "100%", justifyContent: "end" }}>
					<Button onClick={onHide} className="btn-base">
						Huỷ
					</Button>
					<Button type="primary" className="btn-base" htmlType="submit">
						Cập nhật
					</Button>
				</Space>
			</Form>
		</Modal>
	);
};

export default ModalDetailSlot;
