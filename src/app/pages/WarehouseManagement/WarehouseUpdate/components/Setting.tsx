import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Form, Input, Select } from "antd";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import queryString from "querystring";
import { NumericFormat } from "react-number-format";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const Setting = ({ form, scanWarehouse, setShowConfirmScan }) => {
	const navigate = useNavigate();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const valuesForm = Form.useWatch([], { form, preserve: true }) as any;
	console.log(valuesForm?.fulfillment_scan_pack_mode);
	return (
		<Card title="Cấu hình" size="small" style={{ marginTop: 20 }}>
			<Flex vertical gap={10}>
				<Row>
					<Col span={24}>
						<Text strong>Thiết lập số kiện hàng tối đa trong danh sách xử lý</Text>
					</Col>
				</Row>
				<Row gutter={10}>
					<Col span={8}>
						<Form.Item
							label={<strong>Một sản phẩm</strong>}
							name="max_sio"
							validateTrigger="onBlur"
							rules={[
								{
									validator: async (_, value) => {
										if (value === undefined || value === null || value === "") return Promise.resolve();
										const num = parseInt(value);
										console.log(num);
										if (isNaN(num)) return Promise.reject(new Error("Số đơn tối đa phải là số"));
										if (num < 1) return Promise.reject(new Error("Số đơn tối đa trong một danh sách xử lý phải lớn hơn hoặc bằng 1 và nhỏ hơn hoặc bằng 500"));
										if (num > 500) return Promise.reject(new Error("Số đơn tối đa trong một danh sách xử lý phải lớn hơn 1 và nhỏ hơn hoặc bằng 500"));
										return Promise.resolve();
									},
								},
							]}
						>
							<NumericFormat
								placeholder="Nhập GT"
								customInput={Input}
								allowClear
								allowLeadingZeros={false}
								allowNegative={false}
								decimalScale={0}
								onBlur={(e) => {
									if (!e.target.value) {
										form.setFieldValue("max_sio", 50);
									}
								}}
							/>
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label={<strong>Nhiều sản phẩm</strong>}
							name="max_mio"
							validateTrigger="onBlur"
							rules={[
								{
									validator: async (_, value) => {
										if (value === undefined || value === null || value === "") return Promise.resolve();
										const num = parseInt(value);
										if (isNaN(num)) return Promise.reject(new Error("Số đơn tối đa phải là số"));
										if (num < 1) return Promise.reject(new Error("Số đơn tối đa trong một danh sách xử lý phải lớn hơn hoặc bằng và nhỏ hơn hoặc bằng 500"));
										if (num > 500) return Promise.reject(new Error("Số đơn tối đa trong một danh sách xử lý phải lớn hơn 1 và nhỏ hơn hoặc bằng 500"));
										return Promise.resolve();
									},
								},
							]}
						>
							<NumericFormat
								placeholder="Nhập GT"
								customInput={Input}
								allowClear
								allowLeadingZeros={false}
								allowNegative={false}
								decimalScale={0}
								onBlur={(e) => {
									if (!e.target.value) {
										form.setFieldValue("max_mio", 50);
									}
								}}
							/>
						</Form.Item>
					</Col>
					{/* <Col span={8}>
						<Form.Item
							label={<strong>Hỗn hợp</strong>}
							name="max_mixio"
							validateTrigger="onBlur"
							rules={[
								{
									validator: async (_, value) => {
										if (value === undefined || value === null || value === "") return Promise.resolve();
										const num = parseInt(value);
										if (isNaN(num)) return Promise.reject(new Error("Số đơn tối đa phải là số"));
										if (num < 2) return Promise.reject(new Error("Số đơn tối đa trong một danh sách xử lý phải lớn hơn 1 và nhỏ hơn hoặc bằng 500"));
										if (num > 500) return Promise.reject(new Error("Số đơn tối đa trong một danh sách xử lý phải lớn hơn 1 và nhỏ hơn hoặc bằng 500"));
										return Promise.resolve();
									},
								},
							]}
						>
							<NumericFormat placeholder="Nhập GT" customInput={Input} allowClear allowLeadingZeros={false} allowNegative={false} decimalScale={0} />
						</Form.Item>
					</Col> */}
				</Row>
			</Flex>
		</Card>
	);
};

export default Setting;
