import React, { useState, useEffect, useMemo } from "react";
import { Button, Col, Flex, Row, Typography, Input, DatePicker, Select, Image } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import queryString from "querystring";
import _, { omit } from "lodash";
import { OPTIONS_STATUS, TIME_SEARCH_OPTIONS } from "../constants";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const ReturnReceiptFilter = ({ listShippingCarrier }) => {
	const navigate = useNavigate();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [dateRange, setDateRange] = useState<any>([dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")]);
	const [searchText, setSearchText] = useState<string>(params?.q || "");

	useEffect(() => {
		if (params?.q) {
			setSearchText(String(params?.q || ""));
		}
	}, [params?.q]);

	return (
		<>
			<Row style={{ marginBottom: 20 }} gutter={10}>
				{/* Filter 1 */}
				<Col span={16}>
					<Row align={"middle"}>
						<Col span={8}>
							<Select
								style={{ width: "100%" }}
								className="custom-border"
								onChange={(val) => {
									navigate(
										`${location.pathname}?${queryString.stringify({
											...params,
											page: 1,
											date_search_type: val,
										})}`.replaceAll("%2C", ",")
									);
								}}
								options={TIME_SEARCH_OPTIONS}
								value={params?.date_search_type || TIME_SEARCH_OPTIONS[0]?.value}
							/>
						</Col>
						<Col span={16}>
							<RangePicker
								className="custom-border"
								style={{ width: "100%", borderRadius: 0 }}
								value={dateRange as any}
								showTime={false}
								format={"DD/MM/YYYY"}
								allowClear={false}
								onChange={(values: any) => {
									if (values && values.length === 2) {
										// Chọn range
										const [start, end] = values;
										navigate(
											`${location.pathname}?${queryString.stringify({
												...params,
												gt: start.startOf('day').unix(),
												lt: end.endOf('day').unix(),
												page: 1,
											})}`
										);
										setDateRange(values);
									} else {
										setDateRange([dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")]);

										navigate(`${location.pathname}?${queryString.stringify(omit(params, ["gt", "lt"]))}`);
									}
								}}
							/>
						</Col>
					</Row>
				</Col>
				{/* Filter 2 */}
				<Col span={8}>
					<Select
						style={{ width: "100%" }}
						className="custom-border"
						placeholder="Trạng thái phiếu"
						mode="multiple"
						allowClear={true}
						onChange={(values) => {
							if (values?.length) {
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										page: 1,
										status: values?.join(","),
									})}`.replaceAll("%2C", ",")
								);
							} else {
								navigate(`${location.pathname}?${queryString.stringify(omit(params, ["status"]))}`.replaceAll("%2C", ","));
							}
						}}
						options={OPTIONS_STATUS}
						value={params?.status?.split(",")}
					/>
				</Col>
			</Row>
			<Row style={{ marginBottom: 20 }} gutter={10}>
				{/* Filter 3 */}
				<Col span={16}>
					<Input
						placeholder={params?.tab == 'speciral_order' ? "Tìm kiếm mã kiện hàng" : "Tìm kiếm mã phiếu nhận trả"}
						onKeyDown={(e) => {
							if (e?.key === "Enter") {
								const target = e?.target as HTMLInputElement;
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										q: target?.value,
										page: 1,
									})}`.replaceAll("%2C", ",")
								);
							}
						}}
						style={{ borderRadius: 0 }}
						value={searchText}
						onChange={(e) => {
							setSearchText(e?.target?.value);
						}}
						onBlur={(e) => {
							navigate(
								`${location.pathname}?${queryString.stringify({
									...params,
									q: e?.target?.value,
								})}`.replaceAll("%2C", ",")
							);
						}}
					/>
				</Col>
				<Col span={8}>
					<Select
						style={{ width: "100%" }}
						className="custom-border"
						placeholder="Đơn vị vận chuyển"
						mode="multiple"
						allowClear={true}
						onChange={(values) => {
							if (values?.length) {
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										page: 1,
										shippingCarriers: values?.join(","),
									})}`.replaceAll("%2C", ",")
								);
							} else {
								navigate(`${location.pathname}?${queryString.stringify(omit(params, ["shippingCarriers"]))}`.replaceAll("%2C", ","));
							}
						}}
						options={listShippingCarrier}
						value={params?.shippingCarriers?.split(",")}
					/>
				</Col>
			</Row>
		</>
	);
};

export default ReturnReceiptFilter;
