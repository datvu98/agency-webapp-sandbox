import React, { useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Spin } from "antd";
import { useQuery, useMutation } from "@apollo/client";
import mutate_locationManagerCreate from "graphql/mutations/mutate_locationManagerCreate";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import { showAlert } from "utils/helper";

const ModalAddRack = ({ onHide, show, warehouseId }) => {
	const [form] = Form.useForm();
	const valuesForm = Form.useWatch([], { form, preserve: true }) as any;

	const [locationManagerCreate, { loading: loadingCreate }] = useMutation(mutate_locationManagerCreate, {
		awaitRefetchQueries: true,
		refetchQueries: ["locationManagerList"],
	});

	// Queries
	const { data: dataArea, loading: loadingArea } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "area", isActive: true },
		fetchPolicy: "cache-and-network",
	});

	const { data: dataAisle, loading: loadingAisle } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "aisle", isActive: true },
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

	// Submit handler
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			const { data } = await locationManagerCreate({
				variables: {
					created: {
						code: values.code.toUpperCase(),
						name: values.name,
						priority: +values.priority,
						type: "rack",
						warehouseId,
						areaId: values.area,
						aisleId: values.aisle,
					},
				},
			});

			if (data?.locationManagerCreate?.success) {
				showAlert.success("Tạo kệ thành công.");
				form.resetFields();
				onHide();
			} else {
				showAlert.error(data?.locationManagerCreate?.message || "Tạo kệ thất bại.");
			}
		} catch (err) {
			console.log("Validation failed:", err);
		}
	};

	return (
		<Modal
			title={"Thêm mới kệ"}
			open={show}
			onCancel={onHide}
			centered
			width={600}
			footer={[
				<Button key="cancel" onClick={onHide} disabled={loadingCreate} className="btn-base">
					Huỷ
				</Button>,
				<Button key="submit" type="primary" onClick={handleSubmit} loading={loadingCreate} className="btn-base">
					Tạo
				</Button>,
			]}
		>
			<Spin spinning={loadingArea || loadingAisle}>
				<Form layout="vertical" form={form}>
					<Form.Item name="area" label={"Mã khu vực"} rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}>
						<Select options={optionArea} placeholder={"Chọn khu vực"} showSearch optionFilterProp="label" size="large" onChange={() => form.setFieldValue("aisle", undefined)} />
					</Form.Item>

					<Form.Item name="aisle" label={"Mã luống đi"} rules={[{ required: true, message: "Vui lòng chọn luống đi" }]}>
						<Select
							options={valuesForm?.["area"] ? optionAisle.filter((opt) => opt.areaId === valuesForm?.["area"]) : []}
							placeholder={"Chọn luống đi"}
							showSearch
							optionFilterProp="label"
							size="large"
						/>
					</Form.Item>

					<Form.Item
						name="code"
						label={"Mã kệ"}
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
						<Input maxLength={50} size="large" placeholder={"Nhập mã kệ"} onChange={(e) => form.setFieldsValue({ code: e.target.value.toUpperCase() })} />
					</Form.Item>

					<Form.Item
						name="name"
						label={"Tên kệ"}
						rules={[
							{ max: 125, message: "Tên kệ tối đa 125 ký tự" },
							{
								validator: (_, value) => {
									if (!value) return Promise.resolve();
									if (value.trim().length !== value.length) return Promise.reject("Tên kệ không được chứa dấu cách ở đầu và cuối");
									if (/\s\s+/g.test(value)) return Promise.reject("Tên kệ không được chứa 2 dấu cách liên tiếp");
									return Promise.resolve();
								},
							},
						]}
					>
						<Input maxLength={125} size="large" placeholder={"Nhập tên kệ"} />
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
							style={{ width: "100%" }}
							size="large"
							placeholder={"Nhập mức độ ưu tiên"}
							onKeyPress={(e) => {
								if (!/[0-9]/.test(e.key)) e.preventDefault();
							}}
						/>
					</Form.Item>
				</Form>
			</Spin>
		</Modal>
	);
};

export default ModalAddRack;
