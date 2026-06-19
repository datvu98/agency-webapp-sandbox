import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Form, Input, Select } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import queryString from "querystring";
import { NumericFormat } from "react-number-format";
import query_crmGetProvince from "graphql/queries/query_crmGetProvince";
import query_crmGetDistrict from "graphql/queries/query_crmGetDistrict";
import query_crmGetWards from "graphql/queries/query_crmGetWards";
import { groupBy } from "lodash";

const { Text } = Typography;

const GeneralInfo = ({ form }) => {
	const navigate = useNavigate();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const provinceValueForm = Form.useWatch("province", form);
	const ward = Form.useWatch("ward", form);

	const { data: dataCrmGetProvince } = useQuery(query_crmGetProvince, {
		variables: {
			is_new: 1,
		},
		fetchPolicy: "cache-and-network",
	});
	const { data: dataWards } = useQuery(query_crmGetWards, {
		fetchPolicy: "cache-and-network",
		variables: {
			province_code: provinceValueForm,
			is_new: 1,
		},
		skip: !provinceValueForm,
	});

	const optionsProvince = useMemo(() => {
		return dataCrmGetProvince?.crmGetProvince?.map((province) => ({
			value: province?.code,
			label: province?.name,
		}));
	}, [dataCrmGetProvince]);

	return (
		<Card title="Thông tin cơ bản" size="small">
			<Flex vertical>
				<Row gutter={10}>
					<Col span={12}>
						<Form.Item
							label={<strong>Tên kho</strong>}
							name="nameWarehouse"
							required
							validateTrigger="onBlur"
							rules={[
								{
									required: true,
									message: "Vui lòng nhập tên kho",
								},
								{
									min: 10,
									message: "Tên kho tối thiểu 10 ký tự",
								},
								{
									max: 120,
									message: "Tên kho tối đa 120 ký tự",
								},
								{
									validator: async (_, value) => {
										if (!value) return Promise.resolve();
										if (value.trim().length !== value.length) {
											return Promise.reject(new Error("Tên kho không được chứa dấu cách ở đầu và cuối"));
										}
										if (/\s\s+/g.test(value)) {
											return Promise.reject(new Error("Tên kho không được chứa 2 dấu cách liên tiếp"));
										}
										return Promise.resolve();
									},
								},
							]}
						>
							<Input placeholder="Nhập tên kho" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={<strong>Mã kho</strong>}
							name="codeWarehouse"
							required
							validateTrigger="onBlur"
							rules={[
								{
									required: true,
									message: "Vui lòng nhập mã kho",
								},
								{
									max: 120,
									message: "Mã kho tối đa 120 ký tự",
								},
							]}
						>
							<Input placeholder="Nhập mã kho" />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={10}>
					<Col span={12}>
						<Form.Item
							label={<strong>Nhân viên phụ trách</strong>}
							name="staff_name"
							required
							validateTrigger="onBlur"
							rules={[
								{
									required: true,
									message: "Vui lòng nhập tên nhân viên phụ trách",
								},
								{
									min: 5,
									message: "Tên nhân viên phụ trách tối thiểu 5 ký tự",
								},
								{
									max: 100,
									message: "Tên nhân viên phụ trách tối đa 100 ký tự",
								},
								{
									validator: async (_, value) => {
										if (!value) return Promise.resolve();
										if (value.trim().length !== value.length) {
											return Promise.reject(new Error("Tên nhân viên phụ trách không được chứa dấu cách ở đầu và cuối"));
										}
										if (/\s\s+/g.test(value)) {
											return Promise.reject(new Error("Tên nhân viên phụ trách không được chứa 2 dấu cách liên tiếp"));
										}
										return Promise.resolve();
									},
								},
							]}
						>
							<Input placeholder="Nhập tên nhân viên phụ trách" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label={<strong>Số điện thoại gửi hàng</strong>}
							name="phone_num"
							required
							validateTrigger="onBlur"
							rules={[
								{
									required: true,
									message: "Vui lòng nhập mã số điện thoại gửi hàng",
								},
								{
									max: 15,
									message: "Số điện thoại gửi hàng tối đa là 15 số",
								},
							]}
						>
							<Input placeholder="Số điện thoại" />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={10}>
					<Col span={12}>
						<Form.Item
							name="province"
							required
							label={<strong>Tỉnh/Thành phố</strong>}
							rules={[
								{
									required: true,
									message: "Vui lòng chọn Tỉnh/Thành phố",
								},
							]}
							validateTrigger={["onBlur", "onChange"]}
						>
							<Select
								showSearch
								placeholder="Tỉnh/Thành phố"
								optionFilterProp="label"
								onChange={() => {
									form.setFieldValue("ward", null);
								}}
								allowClear
								options={optionsProvince || []}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="ward"
							required
							label={<strong>Xã/Phường</strong>}
							rules={[
								{
									required: true,
									message: "Vui lòng chọn Xã/Phường",
								},
							]}
							validateTrigger={["onBlur", "onChange"]}
						>
							<Select
								placeholder="Xã/Phường"
								optionFilterProp="label"
								allowClear
								showSearch
								disabled={!provinceValueForm}
								options={
									dataWards?.crmGetWards?.map((item) => {
										return {
											value: item?.code,
											label: item?.name,
										};
									}) || []
								}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={10}>
					<Col span={8}>
						<Form.Item
							name="address"
							required
							label={<strong>Địa chỉ</strong>}
							rules={[
								{
									required: true,
									message: "Vui lòng nhập địa chỉ",
								},
								{
									min: 10,
									message: "Địa chỉ tối thiểu 10 kí tự",
								},
								{
									max: 255,
									message: "Địa chỉ tối đa 255 kí tự",
								},
							]}
							validateTrigger={["onBlur"]}
						>
							<Input.TextArea placeholder="Địa chỉ" maxLength={255} showCount rows={4} />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label={<strong>Vĩ độ</strong>}
							name="latitude"
							validateTrigger="onBlur"
							rules={[
								{
									validator: async (_, value) => {
										if (value === undefined || value === null || value === "") return Promise.resolve();
										const num = parseFloat(value);
										if (isNaN(num)) return Promise.reject(new Error("Vĩ độ phải là số"));
										if (num < -90) return Promise.reject(new Error("Vĩ độ tối thiểu là -90 độ."));
										if (num > 90) return Promise.reject(new Error("Vĩ độ tối đa là 90 độ."));
										return Promise.resolve();
									},
								},
							]}
						>
							<NumericFormat placeholder="Nhập vĩ độ" customInput={Input} allowClear allowLeadingZeros={false} allowNegative decimalScale={10} />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label={<strong>Kinh độ</strong>}
							name="longtitude"
							validateTrigger="onBlur"
							rules={[
								{
									validator: async (_, value) => {
										if (value === undefined || value === null || value === "") return Promise.resolve();
										const num = parseFloat(value);
										if (isNaN(num)) return Promise.reject(new Error("Kinh độ phải là số"));
										if (num < -180) return Promise.reject(new Error("Kinh độ tối thiểu là -180 độ."));
										if (num > 180) return Promise.reject(new Error("Kinh độ tối đa là 180 độ."));
										return Promise.resolve();
									},
								},
							]}
						>
							<NumericFormat placeholder="Nhập kinh độ" customInput={Input} allowClear allowLeadingZeros={false} allowNegative decimalScale={10} />
						</Form.Item>
					</Col>
				</Row>
			</Flex>
		</Card>
	);
};

export default GeneralInfo;
