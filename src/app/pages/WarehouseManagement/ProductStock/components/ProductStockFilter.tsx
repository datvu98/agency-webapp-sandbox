import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Select, Tabs, Input } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import queryString from "querystring";
import { omit } from "lodash";
import { OPTIONS_TYPE_PRODUCT, TABS } from "../constants";
import { FieldTimeOutlined, QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { formatNumberToCurrency } from "utils/helper";
const { Text } = Typography;

const ProductStockFilter = ({ dataSme, dataWarehouse, dataBrand, agencyListInventoryItems, onExport, statusData }) => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useSelector(selectGlobalSlice);
	const params = new URLSearchParams(location.search);
	const queryParams = Object.fromEntries(params.entries());
	const [searchText, setSearchText] = useState(queryParams?.q || "");

	const optionSmes = useMemo(() => {
		if (!dataSme?.agencyGetSme?.length) return [];
		return dataSme?.agencyGetSme?.map((sme) => ({
			label: `${sme?.sme_id} - ${sme?.full_name}`,
			value: sme?.sme_id,
		}));
	}, [dataSme]);

	const optionWarehouses = useMemo(() => {
		if (!dataWarehouse?.smeWarehouseByAgency?.data?.length) return [];
		return dataWarehouse?.smeWarehouseByAgency?.data?.map((wh) => ({
			label: wh?.name,
			value: wh?.id,
		}));
		
	}, [dataWarehouse]);

	const optionBrands = useMemo(() => {
		if (!dataBrand?.sme_brands?.length) return [];
		if (!queryParams?.ups) {
			return dataBrand?.sme_brands?.map((brand) => ({
				label: `${brand?.sme_id} - ${brand?.name}`,
				value: brand?.id,
			}));
		} else {
			const listUpS = queryParams?.ups?.split(",")?.map((whId) => Number(whId));
			return dataBrand?.sme_brands
				?.filter((brand) => listUpS?.includes(brand?.sme_id))
				?.map((brand) => ({
					label: `${brand?.sme_id} - ${brand?.name}`,
					value: brand?.id,
				}));
		}
	}, [dataBrand, queryParams?.ups]);

	const optionProductStatus = useMemo(() => {
		if (!statusData?.sme_product_status?.length) return [];
		if (!queryParams?.ups) {
			return statusData?.sme_product_status?.map((item) => ({
				label: `${item?.sme_id} - ${item?.name}`,
				value: item?.id,
			}));
		} else {
			const listUpS = queryParams?.ups?.split(",")?.map((whId) => Number(whId));
			return statusData?.sme_product_status
				?.filter((status) => listUpS?.includes(status?.sme_id))
				?.map((status) => ({
					label: `${status?.sme_id} - ${status?.name}`,
					value: status?.id,
				}));
		}
	}, [statusData, queryParams?.ups]);

	const handleNavigate = (newParams) => {
		navigate(
			`${location.pathname}?${queryString.stringify({
				...params,
				...newParams,
			})}`
		);
	};
	return (
		<>
			<Flex style={{ marginBottom: 8 }}>
				<Tabs
					onChange={(key) => {
						navigate(`${location.pathname}?tab=${key}`);
					}}
					activeKey={params.get("tab") || "new"}
					type="card"
					items={TABS}
				/>
			</Flex>
			<Row gutter={8} style={{ marginBottom: 10 }}>
				<Col span={6}>
					<Select
						placeholder={"Chọn UpS"}
						allowClear
						mode="multiple"
						className="w-100"
						value={
							params.get("ups")
								? params
										.get("ups")
										?.split(",")
										.map((id) => Number(id))
								: undefined
						}
						options={optionSmes}
						optionFilterProp="label"
						onChange={(values) => {
							if (!values?.length) {
								handleNavigate(omit(queryParams, ["ups", "warehouses", "brands"]));
							} else {
								handleNavigate(
									omit(
										{
											...queryParams,
											page: 1,
											ups: values.join(","),
										},
										["warehouses", "brands"]
									)
								);
							}
						}}
					/>
				</Col>
				<Col span={6}>
					<Select
						placeholder={"Chọn kho"}
						allowClear
						mode="multiple"
						className="w-100"
						value={
							params.get("warehouses")
								? params
										.get("warehouses")
										?.split(",")
										.map((id) => Number(id))
								: undefined
						}
						options={optionWarehouses}
						optionFilterProp="label"
						onChange={(values) => {
							if (!values?.length) {
								handleNavigate(omit(queryParams, ["warehouses"]));
							} else {
								handleNavigate({
									...queryParams,
									page: 1,
									warehouses: values.join(","),
								});
							}
						}}
					/>
				</Col>
				<Col span={6}>
					<Select
						placeholder={"Chọn nhãn hàng"}
						allowClear
						mode="multiple"
						className="w-100"
						value={
							params.get("brands")
								? params
										.get("brands")
										?.split(",")
										.map((id) => Number(id))
								: undefined
						}
						options={optionBrands}
						optionFilterProp="label"
						onChange={(values) => {
							if (!values?.length) {
								handleNavigate(omit(queryParams, ["brands"]));
							} else {
								handleNavigate({
									...queryParams,
									page: 1,
									brands: values.join(","),
								});
							}
						}}
					/>
				</Col>
				{queryParams?.tab != "other" && (
					<Col span={6}>
						<Select
							placeholder={"Chọn loại sản phẩm"}
							allowClear
							className="w-100"
							value={params.get("typeProduct") ? params.get("typeProduct") : undefined}
							options={OPTIONS_TYPE_PRODUCT}
							optionFilterProp="label"
							onChange={(value) => {
								if (!value) {
									handleNavigate(omit(queryParams, ["typeProduct"]));
								} else {
									handleNavigate({
										...queryParams,
										page: 1,
										typeProduct: value,
									});
								}
							}}
						/>
					</Col>
				)}
				{queryParams?.tab == "other" && (
					<Col span={6}>
						<Select
							placeholder={" Trạng thái hàng hóa"}
							allowClear
							className="w-100"
							value={params.get("productStatus") ? Number(params.get("productStatus")) : undefined}
							options={optionProductStatus}
							optionFilterProp="label"
							onChange={(value) => {
								if (!value) {
									handleNavigate(omit(queryParams, ["productStatus"]));
								} else {
									handleNavigate({
										...queryParams,
										page: 1,
										productStatus: value,
									});
								}
							}}
						/>
					</Col>
				)}
			</Row>
			<Row gutter={8}>
				<Col span={6}>
					<Input
						placeholder="Tên sản phẩm/SKU"
						value={searchText}
						prefix={<SearchOutlined />}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSearchText(e.target.value);
						}}
						onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
							navigate(
								`${location.pathname}?${queryString.stringify({
									...queryParams,
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
										...queryParams,
										page: 1,
										q: target.value,
									})}`
								);
							}
						}}
						suffix={<i className="flaticon2-search-1 icon-md ml-6" />}
					/>
				</Col>
			</Row>
			<Flex align="center" style={{ padding: 8 }} gap={10}>
				{/* <Text>
					Tổng giá trị hàng tồn kho hiện có
					<Tooltip title="Tổng giá trị tồn kho = Giá vốn hàng hóa x Số lượng tồn hiện tại">
						<QuestionCircleOutlined style={{ fontSize: 12, margin: "0 4px" }} />
					</Tooltip>
					:
				</Text>
				<Text strong>{`${formatNumberToCurrency(agencyListInventoryItems?.agencyListInventoryItems?.meta?.total_inventory_value)}đ`}</Text> */}
				<Text>
					Tổng hàng tồn kho hiện có
					<Tooltip title="Tổng hàng tồn kho hiện có được tính bằng tổng tồn thực tế của những sản phẩm trong kho ngoại trừ sản phẩm combo.">
						<QuestionCircleOutlined style={{ fontSize: 12, margin: "0 4px" }} />
					</Tooltip>
					:
				</Text>
				<Text strong>{`${formatNumberToCurrency(agencyListInventoryItems?.agencyListInventoryItems?.meta?.total_inventory_quantity)}`}</Text>
			</Flex>
			<Flex justify="end" gap={10}>
				<Button type="primary" className="btn-base" onClick={onExport}>
					Xuất file
				</Button>
				<Button
					key="cancel"
					style={{ height: 35 }}
					onClick={() => {
						navigate("/warehouse-manage/history-export-product-stock");
					}}
				>
					<FieldTimeOutlined />
				</Button>
			</Flex>
		</>
	);
};

export default ProductStockFilter;
