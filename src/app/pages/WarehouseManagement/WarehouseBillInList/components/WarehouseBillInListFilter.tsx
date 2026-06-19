import { Button, Col, Flex, Row, Typography, Input, DatePicker, Select, Image } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import queryString from "querystring";
import { CloseOutlined, FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import _, { omit } from "lodash";
import Paragraph from "antd/es/typography/Paragraph";
import WarehouseBillInListFilterDrawer from "./WarehouseBillInListFilterDrawer";
import { DISCREPANCY_OPTIONS, OPTIONS_EVIDENCE, OPTIONS_PROTOCOL, SEARCH_OPTIONS, SEARCH_OPTIONS_BILL_IN, STATUS_BILL_OPTIONS } from "../constants";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const WarehouseBillInListFilter = ({ optionSmes, optionsWarehouse, optionsBrand, optionsStore }) => {
	const navigate = useNavigate();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [searchText, setSearchText] = useState<string>(params?.q || "");
	const [dateRange, setDateRange] = useState<any>([dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")]);
	const [showDrawer, setShowDrawer] = useState(false);

	useEffect(() => {
		if (params?.q) {
			setSearchText(String(params?.q || ""));
		}
	}, [params?.q]);

	const filterBlock = useMemo(() => {
		const blockWarehouse = optionsWarehouse?.filter((_option) => params?.warehouses?.split(",")?.some((param) => param == _option?.value));
		const blockBrand = optionsBrand?.filter((_option) => params?.brands?.split(",")?.some((param) => param == _option?.value));
		const blockStore = optionsStore?.filter((_option) => params?.stores?.split(",")?.some((param) => param == _option?.value));
		const blockProtocol = OPTIONS_PROTOCOL?.find((_option) => params?.protocols === _option?.value);
		const blockEvidence = OPTIONS_EVIDENCE?.find((_option) => params?.evidence === _option?.value);

		return (
			<Flex style={{ gap: 10 }} wrap="wrap">
				{blockWarehouse?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 5,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`Kho vật lý: ${_.map(blockWarehouse, (item) => item.label)?.join(", ")}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 5 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "warehouses"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
				{blockBrand?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 5,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`Nhãn quản lý: ${_.map(blockBrand, (item) => item.label)?.join(", ")}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 5 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "brands"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
				{blockStore?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 5,
						}}
					>
						<Flex gap={4}>
							<Text>Gian hàng:</Text>
							<Flex gap={4}>
								{blockStore.map((item, index) => {
									return (
										<Flex align="center" gap={4}>
											{index != 0 && <Text>,</Text>}
											<Text>{!!item?.channel?.logo_asset_url && <Image src={item?.channel?.logo_asset_url} preview={false} width={18} height={18} alt="" />}</Text>
											<Text>{item?.label}</Text>
										</Flex>
									);
								})}
							</Flex>
						</Flex>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 5 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "stores"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
				{!!blockProtocol && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 5,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`Hình thức nhập kho: ${blockProtocol?.label}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 5 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "protocols"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
				{!!blockEvidence && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 5,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`Thông tin chứng từ: ${blockEvidence?.label}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 5 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "evidence"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
			</Flex>
		);
	}, [params, optionSmes, optionsWarehouse, optionsBrand]);
	return (
		<>
			{showDrawer && (
				<WarehouseBillInListFilterDrawer
					showDrawer={showDrawer}
					setShowDrawer={setShowDrawer}
					optionsWarehouse={optionsWarehouse}
					optionSmes={optionSmes}
					optionsBrand={optionsBrand}
					optionsStore={optionsStore}
				/>
			)}
			<Row style={{ marginBottom: 20 }} gutter={10}>
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
								options={SEARCH_OPTIONS_BILL_IN}
								value={params?.date_search_type || SEARCH_OPTIONS_BILL_IN[0]?.value}
							/>
						</Col>
						<Col span={16}>
							<RangePicker
								className="custom-border"
								style={{ width: "100%", borderRadius: 0 }}
								value={dateRange as any}
								showTime={{ format: 'HH:mm' }}
								format={"DD/MM/YYYY HH:mm"}
								onChange={(values: any) => {
									if (values && values.length === 2) {
										// Chọn range
										const [start, end] = values;
										navigate(
											`${location.pathname}?${queryString.stringify({
												...params,
												gt: start.unix(),
												lt: end.unix(),
                                                page: 1
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
				<Col span={8}>
					<Select
						style={{ width: "100%" }}
						placeholder="Chọn UpS"
						showSearch
						optionFilterProp="label"
						mode="multiple"
						onChange={(val) => {
							navigate(
								`${location.pathname}?${queryString.stringify(
									omit(
										{
											...params,
											ups: val.join(","),
                                            page: 1
										},
										["stores", "brands"]
									)
								)}`.replaceAll("%2C", ",")
							);
						}}
						options={optionSmes}
						value={params?.ups ? params?.ups?.split(",")?.map((item) => Number(item)) : []}
					/>
				</Col>
			</Row>
			<Row style={{ marginBottom: 20 }} gutter={10}>
				<Col span={8}>
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
											search_type: val,
										})}`.replaceAll("%2C", ",")
									);
								}}
								options={SEARCH_OPTIONS}
								value={params?.search_type || SEARCH_OPTIONS[0]?.value}
							/>
						</Col>
						<Col span={16}>
							<Input
								placeholder={SEARCH_OPTIONS?.find(opt => opt?.value ==  params?.search_type)?.placeholder || SEARCH_OPTIONS[0]?.placeholder}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										const target = e.target as HTMLInputElement;
										navigate(
											`${location.pathname}?${queryString.stringify({
												...params,
												q: target.value,
                                                page: 1
											})}`.replaceAll("%2C", ",")
										);
									}
								}}
								style={{ borderRadius: 0 }}
								value={searchText}
								onChange={(e) => {
									setSearchText(e.target.value);
								}}
								onBlur={(e) => {
									navigate(
										`${location.pathname}?${queryString.stringify({
											...params,
											q: e.target.value,
										})}`.replaceAll("%2C", ",")
									);
								}}
							/>
						</Col>
					</Row>
				</Col>
				<Col span={4}>
					<Select
						style={{ width: "100%" }}
						className="custom-border"
						placeholder='Chọn trạng thái'
						mode="multiple"
						allowClear
						onChange={(values) => {
							if (values?.length) {
								console.log(values)
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										page: 1,
										fulfillmentStatus: values?.join(','),
									})}`.replaceAll("%2C", ",")
								);
							} else {
								navigate(
									`${location.pathname}?${queryString.stringify(omit(params, ['fulfillmentStatus']))}`.replaceAll("%2C", ",")
								);
							}
						}}
						options={STATUS_BILL_OPTIONS}
						value={params?.fulfillmentStatus?.split(',')}
					/>
				</Col>

				<Col span={4}>
					<Select
						style={{ width: "100%" }}
						className="custom-border"
						placeholder='Chênh lệch sau nhập'
						allowClear
						onChange={(value) => {
							console.log(value)
							if (value) {
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										page: 1,
										hasQuantityDiscrepancy: value,
									})}`.replaceAll("%2C", ",")
								);
							} else {
								navigate(
									`${location.pathname}?${queryString.stringify(omit(params, ['hasQuantityDiscrepancy']))}`.replaceAll("%2C", ",")
								);
							}
						}}
						options={DISCREPANCY_OPTIONS}
						value={params?.hasQuantityDiscrepancy}
					/>
				</Col>
				<Col span={8}>
					<Button
						type="default"
						style={{ width: "100%" }}
						onClick={() => {
							setShowDrawer(true);
						}}
					>
						<Flex align="center" justify="space-between" style={{ width: "100%" }}>
							<Text>Bộ lọc nâng cao</Text>
							<FilterOutlined />
						</Flex>
					</Button>
				</Col>
			</Row>
			<Row>{filterBlock}</Row>
			{/* <Row justify={"end"}>
				<Button type="primary" className="btn-base btn primary" onClick={async () => {}}>
					Xuất file
				</Button>
			</Row> */}
		</>
	);
};

export default WarehouseBillInListFilter;
