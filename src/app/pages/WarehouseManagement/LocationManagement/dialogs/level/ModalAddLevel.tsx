import React, { useMemo } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Spin } from "antd";
import { useQuery, useMutation } from "@apollo/client";
import mutate_locationManagerCreate from "graphql/mutations/mutate_locationManagerCreate";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import { showAlert } from "utils/helper";

const ModalAddLevel = ({ onHide, show, warehouseId }) => {
	const [form] = Form.useForm();

	const [locationManagerCreate, { loading: loadingCreate }] = useMutation(mutate_locationManagerCreate, {
		awaitRefetchQueries: true,
		refetchQueries: ["locationManagerList"],
	});

	// Queries
	const { data: dataArea, loading: loadingArea } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "area", isActive: true },
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
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			const { data } = await locationManagerCreate({
				variables: {
					created: {
						code: `${values.code}`,
						priority: +values.priority,
						type: "level",
						warehouseId: warehouseId,
						areaId: values.area,
					},
				},
			});

			if (data?.locationManagerCreate?.success) {
				showAlert.success("Tạo tầng thành công.");
				form.resetFields();
				onHide();
			} else {
				showAlert.error(data?.locationManagerCreate?.message || "Tạo tầng thất bại.");
			}
		} catch (err) {
			console.log("Validation failed:", err);
		}
	};

	return (
		<Modal
			title={"Thêm mới tầng"}
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
			<Spin spinning={loadingArea}>
				<Form layout="vertical" form={form}>
					<Form.Item name="area" label={"Mã khu vực"} rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}>
						<Select options={optionArea} placeholder={"Chọn khu vực"} showSearch optionFilterProp="label" size="large" />
					</Form.Item>

					<Form.Item
						name="code"
						label={"Mã tầng"}
						rules={[
							{ required: true, message: "Vui lòng nhập mã tầng" },
							{
								validator: (_, value) => {
									if (value === undefined || value === null) {
										return Promise.resolve(); // bỏ qua validator nếu trống
									}
									if (value < 0 || value > 100) {
										return Promise.reject("Mã tầng phải nằm trong 0-100");
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
							placeholder={"Nhập mã tầng"}
						/>
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
							onKeyPress={(e) => {
								if (!/[0-9]/.test(e.key)) e.preventDefault();
							}}
							size="large"
							placeholder={"Nhập mức độ ưu tiên"}
						/>
					</Form.Item>
				</Form>
			</Spin>
		</Modal>
	);
};

export default ModalAddLevel;
