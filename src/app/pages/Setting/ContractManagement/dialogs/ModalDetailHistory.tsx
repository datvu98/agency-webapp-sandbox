import React, { useMemo } from "react";
import { Modal, Space, Button, Row, Col, Form, Input, Typography, Select, Flex, Image, DatePicker } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

const ModalDetailHistory = ({ onHide, show, optionsStore, dataDetail }) => {
	const [form] = Form.useForm();
	const newValues = JSON.parse(dataDetail?.new_values || "{}");
	const oldValues = JSON.parse(dataDetail?.old_values || "{}");
	console.log(newValues);
	const initialValues = useMemo(() => {
		if (!Object.keys(newValues)?.length) return {};
		let init = {};
		Object.keys(newValues)?.forEach((key) => {
            if (key == 'store_ids') {
                init[`${key}_before`] = JSON.parse(oldValues[`${key}`]);
			    init[`${key}_after`] = JSON.parse(newValues[`${key}`]);
            } else if (key == 'begin_at' || key == 'end_at') {
                init[`${key}_before`] = dayjs(oldValues[`${key}`], 'YYYY-MM-DD HH:mm:ss');
			    init[`${key}_after`] = dayjs(newValues[`${key}`], 'YYYY-MM-DD HH:mm:ss');
            } else {
                init[`${key}_before`] =oldValues[`${key}`];
			    init[`${key}_after`] =newValues[`${key}`];
            }
			
		});
		return init;
	}, [newValues, oldValues]);
	console.log(initialValues);
    console.log(optionsStore)
	return (
		<Modal open={show} onCancel={onHide} title="Chi tiết chỉnh sửa" centered width={1000} footer={null} destroyOnClose>
			<Form layout="vertical" form={form} style={{ marginTop: 16 }} initialValues={initialValues}>
				<Row gutter={24}>
					<Col span={12}>
						<Text strong>Thông tin trước khi chỉnh sửa</Text>
						{Object.keys(oldValues)?.map((key) => {
							if (key == "title") {
								return (
									<Form.Item label="Tên hợp đồng" name="title_before" style={{ marginTop: 12 }}>
										<Input readOnly />
									</Form.Item>
								);
							}
							if (key == "store_ids") {
								return (
									<Form.Item label="Tên gian hàng áp dụng" name="store_ids_before">
										<Select
											mode="multiple"
											options={optionsStore}
											style={{ width: "100%" }}
                                            placeholder="Tất cả gian hàng"
											disabled
											optionRender={(option: any) => (
												<Flex align="center" gap={4}>
													<Text>
														{!!option?.data?.channel?.logo_asset_url && <Image src={option?.data?.channel?.logo_asset_url} preview={false} width={18} height={18} alt="" />}
													</Text>
													<Text>{option?.label}</Text>
												</Flex>
											)}
											tagRender={({ value }) => {
												const option: any = optionsStore.find((op: any) => op?.value === value);
												return (
													<Flex align="center" gap={4} className="ant-select-selection-item">
														<Flex align="center" gap={4}>
															<Text>
																{!!option?.channel?.logo_asset_url && <Image src={option?.channel?.logo_asset_url} preview={false} width={18} height={18} alt="" />}
															</Text>
															<Text>{option?.label}</Text>
														</Flex>
													</Flex>
												);
											}}
										/>
									</Form.Item>
								);
							}

							if (key == "begin_at") {
								return (
									<Form.Item label="Ngày bắt đầu hợp đồng" name="begin_at_before">
										<DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} disabled />
									</Form.Item>
								);
							}

							if (key == "end_at") {
								return (
									<Form.Item label="Ngày kết thúc hợp đồng" name="end_at_before">
										<DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} disabled />
									</Form.Item>
								);
							}

							if (key == "end_at") {
								return (
									<Form.Item label="Ngày kết thúc hợp đồng" name="end_at_before">
										<DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} disabled />
									</Form.Item>
								);
							}

							if (key == "description") {
								return (
									<Form.Item label="Mô tả" name="description_before">
										<TextArea rows={3} maxLength={1000} showCount readOnly />
									</Form.Item>
								);
							}
						})}
					</Col>

					<Col span={12}>
						<Text strong>Thông tin sau khi chỉnh sửa</Text>

						{Object.keys(newValues)?.map((key) => {
							if (key == "title") {
								return (
									<Form.Item label="Tên hợp đồng" name="title_after" style={{ marginTop: 12 }}>
										<Input readOnly />
									</Form.Item>
								);
							}
							if (key == "store_ids") {
								return (
									<Form.Item label="Tên gian hàng áp dụng" name="store_ids_after">
										<Select
											mode="multiple"
											options={optionsStore}
											style={{ width: "100%" }}
											disabled
                                            placeholder="Tất cả gian hàng"
											optionRender={(option: any) => (
												<Flex align="center" gap={4}>
													<Text>
														{!!option?.data?.channel?.logo_asset_url && <Image src={option?.data?.channel?.logo_asset_url} preview={false} width={18} height={18} alt="" />}
													</Text>
													<Text>{option?.label}</Text>
												</Flex>
											)}
											tagRender={({ value }) => {
												const option: any = optionsStore.find((op: any) => op?.value === value);
												return (
													<Flex align="center" gap={4} className="ant-select-selection-item">
														<Flex align="center" gap={4}>
															<Text>
																{!!option?.channel?.logo_asset_url && <Image src={option?.channel?.logo_asset_url} preview={false} width={18} height={18} alt="" />}
															</Text>
															<Text>{option?.label}</Text>
														</Flex>
													</Flex>
												);
											}}
										/>
									</Form.Item>
								);
							}

							if (key == "begin_at") {
								return (
									<Form.Item label="Ngày bắt đầu hợp đồng" name="begin_at_after">
										<DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} disabled />
									</Form.Item>
								);
							}

							if (key == "end_at") {
								return (
									<Form.Item label="Ngày kết thúc hợp đồng" name="end_at_after">
										<DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} disabled />
									</Form.Item>
								);
							}

							if (key == "end_at") {
								return (
									<Form.Item label="Ngày kết thúc hợp đồng" name="end_at_after">
										<DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} disabled />
									</Form.Item>
								);
							}

							if (key == "description") {
								return (
									<Form.Item label="Mô tả" name="description_after">
										<TextArea rows={3} maxLength={1000} showCount readOnly />
									</Form.Item>
								);
							}
						})}
					</Col>
				</Row>
			</Form>

			<Space style={{ width: "100%", justifyContent: "end", marginTop: 20 }}>
				<Button onClick={onHide} className="btn-base">
					Thoát
				</Button>
			</Space>
		</Modal>
	);
};

export default ModalDetailHistory;
