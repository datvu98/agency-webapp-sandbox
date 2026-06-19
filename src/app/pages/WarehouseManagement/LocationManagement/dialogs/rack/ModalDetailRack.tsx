import React, { useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, Spin, Button } from "antd";
import { useQuery } from "@apollo/client";
import query_locationManagerList from "graphql/queries/query_locationManagerList";

const ModalDetailRack = ({ onHide, show, warehouseId, dataDetail, setShowModalConfirm }) => {
	const [form] = Form.useForm();
	const valuesForm = Form.useWatch([], { form, preserve: true }) as any;
	// Queries
	const { data: dataArea, loading: loadingDataArea } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "area" },
		fetchPolicy: "cache-and-network",
	});

	const { data: dataAisle, loading: loadingDataAisle } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "aisle" },
		fetchPolicy: "cache-and-network",
	});

	// Options
	const optionArea = useMemo(() => {
		return (
			dataArea?.locationManagerList?.data?.map((item) => ({
				label: item?.code,
				value: item?.id,
			})) || []
		);
	}, [dataArea]);

	const optionAisle = useMemo(() => {
		return (
			dataAisle?.locationManagerList?.data?.map((item) => ({
				label: item?.code,
				value: item?.id,
				areaId: item?.area?.id,
			})) || []
		);
	}, [dataAisle]);

	// Initial values
	const initialValues = useMemo(() => {
		return {
			name: dataDetail?.name || "",
			code: dataDetail?.code || "",
			priority: dataDetail?.priority || "",
			area: dataDetail?.area?.id,
			aisle: dataDetail?.aisle?.id,
		};
	}, [dataDetail]);

	const handleSubmit = (values) => {
		setShowModalConfirm({
			show: true,
			data: {
				type: "rack",
				areaId: values?.area,
				aisleId: values?.aisle,
				id: dataDetail?.id,
				name: values?.name,
				code: values?.code?.toUpperCase(),
				priority: +values?.priority || 0,
			},
		});
		onHide();
	};
	return (
		<Modal title={"Cập nhật kệ"} open={show} onCancel={onHide} footer={null} centered width={600}>
			<Spin spinning={loadingDataArea || loadingDataAisle}>
				<Form layout="vertical" form={form} initialValues={initialValues} onFinish={handleSubmit}>
					<Form.Item label={"Mã khu vực"} name="area" rules={[{ required: true, message: "Vui lòng chọn mã khu vực" }]}>
						<Select
							placeholder={"Chọn khu vực"}
							options={optionArea}
							showSearch
							size="large"
							optionFilterProp="label"
							onChange={() => form.setFieldValue("aisle", undefined)} // reset aisle when area changes
						/>
					</Form.Item>

					<Form.Item label={"Mã luống đi"} name="aisle" rules={[{ required: true, message: "Vui lòng chọn mã luống đi" }]}>
						<Select
							placeholder={"Chọn luống đi"}
							showSearch
							size="large"
							optionFilterProp="label"
							options={valuesForm?.["area"] ? optionAisle.filter((opt) => opt.areaId === valuesForm?.["area"]) : []}
						/>
					</Form.Item>

					<Form.Item
						label={"Mã kệ"}
						name="code"
						rules={[
							{ required: true, message: "Vui lòng nhập mã kệ" },
							{ max: 50, message: "Mã kệ tối đa 50 ký tự" },
							{
								pattern: /^[A-Za-z0-9_]+( [A-Za-z0-9_]+)*$/,
								message:
								  "Mã kệ chỉ gồm chữ in hoa, số, dấu gạch dưới và dấu cách (không có khoảng trắng ở đầu/cuối)",
							  },
						]}
					>
						<Input placeholder={"Nhập mã kệ"} maxLength={50} size="large" onChange={(e) => form.setFieldsValue({ code: e.target.value.toUpperCase() })} />
					</Form.Item>

					<Form.Item
						label={"Tên kệ"}
						name="name"
						rules={[
							{ max: 125, message: "Tên kệ tối đa 125 ký tự" },
							{
								validator: (_, value) => {
									if (!value) return Promise.resolve();
									if (value.trim() !== value) return Promise.reject(new Error("Tên kệ không được chứa dấu cách ở đầu và cuối"));
									if (/\s\s+/.test(value)) return Promise.reject(new Error("Tên kệ không được chứa 2 dấu cách liên tiếp"));
									return Promise.resolve();
								},
							},
						]}
					>
						<Input placeholder={"Nhập tên kệ"} maxLength={125} size="large" />
					</Form.Item>

					<Form.Item
						label={"Mức độ ưu tiên"}
						name="priority"
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
							placeholder={"Nhập mức độ ưu tiên"}
							style={{ width: "100%" }}
							size="large"
							onKeyPress={(e) => {
								if (!/[0-9]/.test(e.key)) e.preventDefault();
							}}
						/>
					</Form.Item>

					<Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
						<Button onClick={onHide} style={{ marginRight: 8 }} className="btn-base">
							Huỷ
						</Button>
						<Button type="primary" className="btn-base" htmlType="submit" loading={loadingDataArea || loadingDataAisle}>
							Đồng ý
						</Button>
					</Form.Item>
				</Form>
			</Spin>
		</Modal>
	);
};

export default ModalDetailRack;
