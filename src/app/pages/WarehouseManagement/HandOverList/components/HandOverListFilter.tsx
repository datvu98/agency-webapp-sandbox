import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { Card, Col, DatePicker, Flex, Row, Select, TimeRangePickerProps, Typography, Tooltip, Input } from "antd";
import { useReportContext } from "app/contexts/ReportContext";
import dayjs, { Dayjs } from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "querystring";
import { omit, pickBy } from "lodash";
import { RangePickerProps } from "antd/es/date-picker";
import { SearchOutlined } from "@ant-design/icons";
import { OPTION_SHIPPING_CARRIERS, OPTION_STATUS, OPTION_TIME } from "../constant";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const HandOverListFilter = ({optionsWarehouse}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [valueRangeTime, setValueRangeTime] = useState<any>([dayjs(), dayjs()]);
	const [searchText, setSearchText] = useState<string>(params?.q || "");

	useEffect(() => {
		if (!params?.gt || !params?.lt) return;
		setValueRangeTime([dayjs.unix(+params?.gt), dayjs.unix(+params?.lt)]);
	}, [params?.gt, params?.lt]);

	return (
		<>
			<Row gutter={20} align="middle">
				<Col span={12}>
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
								options={OPTION_TIME}
								value={params?.date_search_type || OPTION_TIME[0]?.value}
							/>
						</Col>
						<Col span={16}>
							<RangePicker
								format={"DD/MM/YYYY"}
                                className="custom-border w-100"
								value={valueRangeTime}
								onChange={(values: any) => {
									if (values?.length) {
										console.log(values);
										navigate(
											`${location.pathname}?${queryString.stringify({
												...params,
												page: 1,
												gt: dayjs(values?.[0]).startOf('day').unix(),
												lt: dayjs(values?.[1]).endOf('day').unix(),
											})}`
										);
										setValueRangeTime(values);
									} else {
										navigate(`${location.pathname}?${queryString.stringify(omit(params, ["gt", "lt"]))}`);
										setValueRangeTime([dayjs(), dayjs()]);
									}
								}}
							/>
						</Col>
					</Row>
				</Col>
				<Col span={8}>
					<Select
						mode="multiple"
						className="w-100"
						placeholder="Đơn vị vận chuyển"
						value={params?.shippingCarrier ? params?.shippingCarrier?.split(",") : []}
						options={OPTION_SHIPPING_CARRIERS}
						onChange={(values: any) => {
							if (values?.length) {
								console.log(values);
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										page: 1,
										shippingCarrier: values?.join(","),
									})}`
								);
							} else {
								navigate(`${location.pathname}?${queryString.stringify(omit(params, ["shippingCarrier"]))}`);
							}
						}}
						allowClear
						showSearch
						optionFilterProp="label"
					/>
				</Col>
				<Col span={4}>
					<Select
						className="w-100"
						placeholder="Trạng thái phiếu"
						value={params?.status ? params?.status : null}
						options={OPTION_STATUS}
						onChange={(value: any) => {
							if (!!value) {
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										page: 1,
										status: value,
									})}`
								);
							} else {
								navigate(`${location.pathname}?${queryString.stringify(omit(params, ["status"]))}`);
							}
						}}
						allowClear
					/>
				</Col>
			</Row>
			<Row style={{ marginTop: 10, marginBottom: 20 }} gutter={20} align="middle">
				<Col span={12}>
					<Input
						placeholder="Tìm kiếm mã kiện hàng"
						value={searchText}
						prefix={<SearchOutlined />}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSearchText(e.target.value);
						}}
						onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
							navigate(
								`${location.pathname}?${queryString.stringify({
									...params,
									page: 1,
									q: e.target.value,
								})}`
							);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const target = e.target as HTMLInputElement;
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										page: 1,
										q: target.value,
									})}`
								);
							}
						}}
						suffix={<i className="flaticon2-search-1 icon-md ml-6" />}
					/>
				</Col>
				<Col span={12}>
					<Select
						className="w-100"
						placeholder="Kho"
						value={params?.warehouses ? params?.warehouses?.split(',').map(item => Number(item)) : null}
						options={optionsWarehouse}
						mode="multiple"
						onChange={(values: any) => {
							if (!!values?.length) {
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										page: 1,
										warehouses: values?.join(','),
									})}`
								);
							} else {
								navigate(`${location.pathname}?${queryString.stringify(omit(params, ["warehouses"]))}`);
							}
						}}
						allowClear
					/>
				</Col>
			</Row>
		</>
	);
};

export default memo(HandOverListFilter);
