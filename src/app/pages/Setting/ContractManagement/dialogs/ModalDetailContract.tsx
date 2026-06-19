import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Tooltip, Row, Col, Button, Space, Typography, Flex, Image, DatePicker, Spin } from "antd";
import { useQuery, useMutation } from "@apollo/client";
import { showAlert } from "utils/helper";
import dayjs from "dayjs";
import mutate_vrUpsertCmsContract from "graphql/mutations/mutate_vrUpsertCmsContract";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const ModalDetailContract = ({ onHide, show, optionsStore, detailContract, isEditable }) => {
	const [form] = Form.useForm();
	const valuesForm = Form.useWatch([], { form, preserve: true }) as any;
	const [currentStores, setCurrentStores] = useState(detailContract?.store_ids || []);
	const [rangeTime, setRangeTime] = useState<any>([]);

	const [vrUpsertCmsContract, { loading: loadingVrUpsertCmsContract }] = useMutation(mutate_vrUpsertCmsContract, {
		awaitRefetchQueries: true,
		refetchQueries: ["vrCmsContracts"],
	});
	const initialValues = useMemo(() => {
		return {
			name: detailContract?.title,
			description: detailContract?.description,
			rangeTime: [dayjs(detailContract?.begin_at, "YYYY-MM-DD HH:mm:ss"), dayjs(detailContract?.end_at, "YYYY-MM-DD HH:mm:ss")],
		};
	}, [detailContract]);

	// useEffect(() => {
	// 	if(!!detailContract?.begin_at && !!detailContract?.end_at) {
	// 		setRangeTime()
	// 	} else {
	// 		setRangeTime([])
	// 	}
	// }, [detailContract])
	const handleSubmit = async (values) => {
		try {
			const [start, end] = values.rangeTime;
			let { data } = await vrUpsertCmsContract({
				variables: {
					id: detailContract?.id,
					begin_at: start.format("YYYY-MM-DD"),
					end_at: end.format("YYYY-MM-DD"),
					title: values?.name,
					description: values?.description,
					store_ids: currentStores,
					sme_id: detailContract?.sme_id,
				},
			});
			if (data?.vrUpsertCmsContract?.success) {
				showAlert.success("Cập nhật hợp đồng thành công");
				onHide();
			} else {
				showAlert.error(data?.vrUpsertCmsContract?.message || "Cập nhật hợp đồng thất bại");
			}
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<Modal open={show} onCancel={onHide} title={isEditable ? "Sửa hợp đồng" : 'Chi tiết hợp đồng'} centered width={900} footer={null} destroyOnClose>
			<Spin spinning={loadingVrUpsertCmsContract}>
				<Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={initialValues}>
					<Row gutter={16}>
						<Col span={24}>
							<Form.Item
								name="name"
								label="Tên hợp đồng"
								rules={[
									{ required: true, message: "Vui lòng nhập tên hợp đồng" },
									{ max: 255, message: "Tối đa 255 ký tự" },
									{
										validator: (_, value) => {
											if (value && value.trim().length === 0) return Promise.reject("Tên hợp đồng không được chỉ gồm dấu cách");
											return Promise.resolve();
										},
									},
								]}
							>
								<Input placeholder="Nhập tên hợp đồng" disabled={!isEditable}/>
							</Form.Item>
						</Col>
					</Row>
					<Row style={{ marginBottom: 24 }}>
						<Col span={24}>
							<Text>{isEditable ? 'Chọn gian hàng áp dụng' : 'Gian hàng áp dụng'}</Text>
							<Select
								mode={"multiple"}
								value={currentStores}
								options={optionsStore}
								style={{ width: "100%" }}
								placeholder={"Tất cả"}
								onChange={(values) => {
									if (values?.length) {
										setCurrentStores(values);
									} else {
										setCurrentStores([]);
									}
								}}
								disabled={!isEditable}
								optionRender={(option: any) => {
									return (
										<Flex align="center" gap={4}>
											<Text>
												{!!option?.data?.channel?.logo_asset_url && <Image src={option?.data?.channel?.logo_asset_url} preview={false} width={18} height={18} alt="" />}
											</Text>
											<Text>{option?.label}</Text>
										</Flex>
									);
								}}
								tagRender={({ label, value, closable, onClose }) => {
									const option: any = optionsStore.find((op: any) => op.value === value);

									return (
										<Flex align="center" gap={4} className="ant-select-selection-item">
											<Flex align="center" gap={4}>
												<Text>{!!option?.channel?.logo_asset_url && <Image src={option?.channel?.logo_asset_url} preview={false} width={18} height={18} alt="" />}</Text>
												<Text>{option?.label}</Text>
											</Flex>
											{closable && (
												<Text onClick={onClose} style={{ marginLeft: 4, cursor: "pointer" }}>
													×
												</Text>
											)}
										</Flex>
									);
								}}
							/>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Form.Item
								name="rangeTime"
								label="Khoảng thời gian hợp đồng"
								rules={[
									{
										required: true,
										message: "Vui lòng chọn khoảng thời gian hợp đồng",
									},
								]}
							>
								<RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} disabled={!isEditable}/>
							</Form.Item>
						</Col>
					</Row>
					<Row style={{ marginBottom: 24 }}>
						<Col span={24}>
							<Form.Item label="Mô tả" name="description">
								<TextArea rows={3} maxLength={1000} placeholder="Nhập mô tả" showCount disabled={!isEditable}/>
							</Form.Item>
						</Col>
					</Row>

					<Space style={{ width: "100%", justifyContent: "end", marginTop: 10 }}>
						<Button onClick={onHide} className="btn-base">
							Huỷ
						</Button>
						<Button type="primary" className="btn-base" htmlType="submit" disabled={!isEditable}>
							Cập nhật
						</Button>
					</Space>
				</Form>
			</Spin>
		</Modal>
	);
};

export default ModalDetailContract;
