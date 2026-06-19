import React, { memo, useCallback, useMemo, useState } from "react";
import { Table, message, Spin, Col, Row, Flex, Tabs, Typography, Tooltip, Image, Select } from "antd";
import { useMutation, useQuery } from "@apollo/client";
import { formatNumberToCurrency, showAlert, toAbsoluteUrl } from "utils/helper";
import { Link, useLocation, useNavigate } from "react-router-dom";
import queryString from "querystring";
import { OPTION_ORDER_BY, SUB_TABS } from "../constants";
import { HomeOutlined, InboxOutlined, ScheduleOutlined, ShoppingCartOutlined, TruckOutlined, WarningOutlined } from "@ant-design/icons";
import Paragraph from "antd/es/typography/Paragraph";
import copy from "copy-to-clipboard";
import Pagination from "app/components/Pagination";
import WarehouseBillList from "../dialogs/WarehouseBillList";
import DetailsVariantUnit from "../dialogs/DetailsVariantUnit";
import ModalCombo from "../dialogs/ModalCombo";
import { omit } from "lodash";

const { Text } = Typography;

const ProductStockTable = memo(({ agencyListInventoryItems, itemInventory, page, limit }: any) => {
	const navigate = useNavigate();
	const location = useLocation()
	const params = new URLSearchParams(location.search);
	const queryParams = Object.fromEntries(params.entries());
	const [dataCombo, setDataCombo] = useState(null);
	const [currentProductVariantLinked, setCurrentProductVariantLinked] = useState(null);
	const [openModalInventory, setOpenModalInventory] = useState(false);
	const [currentSku, setCurrentSku] = useState(null);
	const [showDetailWhBill, setShowDetailWhBill] = useState<any>(null);
	const [currentSmeWarehouse, setCurrentSmeWarehouse] = useState(null);
	const [openDetailVariantUnit, setOpenDetailVariantUnit] = useState(false);
	const [detailUnit, setDetailUnit] = useState(null);
	// const [variblesGetUnit, setVariblesGetUnit] = useState({});
	console.log(itemInventory);
	let totalRecord = useMemo(() => {
		let count = agencyListInventoryItems?.agencyListInventoryItems?.meta;
		if (!queryParams.type || queryParams?.type == "all") {
			return count?.total;
		}
		return count?.[`${queryParams?.type}`];
	}, [queryParams?.type, agencyListInventoryItems]);
	let totalPage = Math.ceil(totalRecord / limit);
	const dataTable = useMemo(() => {
		return itemInventory?.sme_catalog_inventory_items?.map((product) => {
			return {
				attributes: product?.variant?.attributes,
				sku: product,
				sme_store_id: product?.sme_store_id,
				sme_brand_id: product?.variant?.sme_brand_id,
				main_variant_id: product?.variant?.variant_unit?.main_variant_id,
				product: {
					is_combo: product?.variant?.is_combo,
					asset_url: product?.variant?.sme_catalog_product_variant_assets?.[0]?.asset_url || "",
					product_id: product?.product_id,
					variant: product?.variant,
					name: product?.variant?.sme_catalog_product?.name,
					comboItem: product?.variant?.combo_items,
				},
				type: {
					is_multi_unit: !!product?.variant?.is_multi_unit,
					is_combo: !!product?.variant?.is_combo,
				},
				stock_actual: product?.stock_actual,
				stock_allocated: product?.stock_allocated,
				stock_reserve: product?.stock_reserve,
				sme_catalog_product_id: product?.variant?.sme_catalog_product?.id,
				stock_available: product?.stock_available,
				stock_shipping: product?.stock_shipping,
				stock_warning: product?.variant?.stock_warning,
				stock_preallocate: product?.stock_preallocate,
				cost: product?.variant,
				warehouse: product?.sme_store?.name,
				ups: product?.sme?.full_name,
				brand: product?.variant?.sme_brand?.name,
				variant_id: product?.variant_id,
				product_id: product?.product_id,
				variant_unit: product?.variant?.unit,
				variant_status: product?.variant?.product_status_name,
			};
		});
	}, [itemInventory]);
	const _attributes = (product) => {
		let attributes: string[] = [];
		if (product?.variant?.attributes && product?.variant?.attributes.length > 0) {
			for (let index = 0; index < product?.variant?.attributes.length; index++) {
				const element = product?.variant?.attributes[index];
				attributes.push(`${element?.sme_catalog_product_attribute_value?.name}`);
			}
			return attributes.join(" - ");
		}
		return null;
	};
	const handleCopy = (text: string) => {
		const success = copy(text);
		if (success) {
			showAlert.success("Đã sao chép vào bộ nhớ");
		} else {
			showAlert.error("Sao chép thất bại");
		}
	};
	const columns = [
		{
			title: (
				<Flex align="center">
					<Text>SKU</Text>
				</Flex>
			),
			dataIndex: "sku",
			key: "sku",
			align: "left",
			width: 280,
			fixed: "left",
			render: (item) => {
				return (
					<Flex align="center">
						<Paragraph
							className="cursor-pointer"
							style={{ margin: 0 }}
							ellipsis={{ rows: 1 }}
							onClick={() => {
								handleCopy(item?.variant?.sku);
							}}
						>
							{item?.variant?.sku}
						</Paragraph>
					</Flex>
				);
			},
		},
		{
			title: "Hàng hóa",
			dataIndex: "product",
			key: "product",
			align: "left",
			width: 150,
			render: (item) => {
				return (
					<div style={{ width: 250 }}>
						<Flex align="center" gap={4}>
							{!!item?.asset_url && <Image width={30} height={30} style={{ borderRadius: 8 }} src={item?.asset_url} />}
							<Tooltip title={item?.variant?.sme_catalog_product?.name}>
								<Paragraph
									className="cursor-pointer"
									style={{ margin: 0, maxWidth: "100%" }}
									ellipsis={{ rows: 1 }}
									onClick={() => {
										handleCopy(item?.variant?.sme_catalog_product?.name);
									}}
								>
									{item?.variant?.sme_catalog_product?.name}
								</Paragraph>
							</Tooltip>
							{/* <InfoProduct
                        name={item?.variant?.sme_catalog_product?.name}
                        isSingle
                        url={!item?.variant?.attributes?.length ? `/products/${item?.is_combo == 1 ? 'edit-combo' : 'edit'}/${item.product_id}` : `/products/stocks/detail/${item?.variant?.id}`}
                      /> */}
						</Flex>
						{!!_attributes(item) && (
							<div className="mt-2">
								<Text style={{ color: "#919099", fontSize: 12 }}>{_attributes(item)}</Text>
							</div>
						)}
					</div>
				);
			},
		},
		{
			title: "ĐVT",
			dataIndex: "variant_unit",
			key: "variant_unit",
			align: "center",
			width: 150,
			render: (item) => {
				return <Text>{item || "--"}</Text>;
			},
		},
		{
			title: "Trạng thái",
			dataIndex: "variant_status",
			key: "variant_status",
			align: "center",
			width: 150,
			render: (record) => {
				let typeProducts = "";
				if (queryParams?.status) {
					let words = record?.split(" ");

					for (let i = 0; i < words?.length; i++) {
						typeProducts += words[i][0].toUpperCase();
					}
				}
				return (
					<>
						{!queryParams?.status && <Text>Mới</Text>}
						{!!queryParams?.status && <Text>{typeProducts}</Text>}
					</>
				);
			},
		},
		{
			title: "Loại",
			dataIndex: "type",
			key: "type",
			align: "center",
			width: 150,
			render: (item, record) => {
				return (
					<Flex>
						{!!item?.is_multi_unit ? (
							<Text
								onClick={() => {
									setOpenDetailVariantUnit(true);
									setDetailUnit(record);
								}}
								style={{ cursor: "pointer", color: "#1F59AF" }}
							>
								Nhiều ĐVT
							</Text>
						) : item?.is_combo ? (
							<Text style={{ color: "#FE5629", cursor: "pointer" }} onClick={() => setDataCombo(record?.product?.variant?.combo_items)}>
								Combo
							</Text>
						) : (
							"Thường"
						)}
					</Flex>
				);
			},
		},
		{
			title: (
				<Tooltip title="Tồn kho thực tế">
					<HomeOutlined style={{ fontSize: 16, fontWeight: "bold" }} />
				</Tooltip>
			),
			dataIndex: "stock_actual",
			key: "stock_actual",
			width: 150,
			align: "center",
			render: (item) => {
				return <Text strong>{formatNumberToCurrency(item)}</Text>;
			},
		},
		{
			title: (
				<Tooltip title="Tồn kho tạm giữ">
					<ShoppingCartOutlined style={{ fontSize: 16, fontWeight: "bold" }} />
				</Tooltip>
			),
			dataIndex: "stock_allocated",
			key: "stock_allocated",
			width: 150,
			align: "center",
			render: (item, record) => {
				return (
					<>
						<Text strong style={{ marginRight: 4 }}>
							{formatNumberToCurrency(item)}
						</Text>
						<svg
							onClick={() => {
								setShowDetailWhBill({
									show: true,
									idVariant: record?.product?.variant?.id,
									sme_store_id: record?.sku?.sme_store_id,
									sme_store_name: record?.sku?.sme_store?.name,
									stock_allocated: item,
									skuVariant: record?.product?.variant?.sku,
								});
							}}
							xmlns="http://www.w3.org/2000/svg"
							color="#ff5629"
							width="18"
							height="18"
							fill="currentColor"
							className="cursor-pointer bi bi-file-earmark-text"
							viewBox="0 0 16 16"
						>
							<path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
							<path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
						</svg>
					</>
				);
			},
		},
		{
			title: (
				<Tooltip title="Tồn dự trữ">
					<InboxOutlined style={{ fontSize: 16, fontWeight: "bold" }} />
				</Tooltip>
			),
			dataIndex: "stock_reserve",
			key: "stock_reserve",
			width: 150,
			align: "center",
			render: (item, record) => {
				return (
					<Flex align="center" justify="center">
						<Text strong style={{ marginRight: 4 }}>
							{formatNumberToCurrency(item)}
						</Text>
						{/* <svg
							onClick={() => {
								//   setCurrentSku(record?.product?.variant?.sku);
								//   setCurrentSmeWarehouse({
								//     name: record?.sku?.sme_store?.name,
								//     sme_store_id: record?.sku?.sme_store_id
								//   });
							}}
							xmlns="http://www.w3.org/2000/svg"
							color="#ff5629"
							width="18"
							height="18"
							fill="currentColor"
							className="cursor-pointer bi bi-file-earmark-text"
							viewBox="0 0 16 16"
						>
							<path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
							<path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
						</svg> */}
					</Flex>
				);
			},
		},
		{
			title: (
				<Tooltip title="Tồn kho sẵn sàng bán">
					<ScheduleOutlined style={{ fontSize: 16, fontWeight: "bold" }} />
				</Tooltip>
			),
			dataIndex: "stock_available",
			key: "stock_available",
			width: 150,
			align: "center",
			render: (item) => {
				return <Text strong>{formatNumberToCurrency(item)}</Text>;
			},
		},
		{
			title: (
				<Tooltip title="Tồn kho đang vận chuyển">
					<TruckOutlined style={{ fontSize: 16, fontWeight: "bold" }} />
				</Tooltip>
			),

			dataIndex: "stock_shipping",
			key: "stock_shipping",
			width: 150,
			align: "center",
			render: (item) => {
				return <b>{formatNumberToCurrency(item)}</b>;
			},
		},
		{
			title: (
				<Tooltip title="Cảnh báo tồn hàng hóa">
					<WarningOutlined color="yellow" style={{ fontSize: 16, fontWeight: "bold" }} />
				</Tooltip>
			),
			dataIndex: "stock_warning",
			key: "stock_warning",
			width: 150,
			align: "center",
			render: (item) => {
				return <b>{typeof item == "number" ? formatNumberToCurrency(item) : "--"}</b>;
			},
		},
		{
			title: "UpS",
			dataIndex: "ups",
			key: "ups",
			width: 130,
			align: "center",
			render: (item) => {
				return item;
			},
		},
		{
			title: "Kho",
			dataIndex: "warehouse",
			key: "warehouse",
			width: 130,
			align: "center",
			render: (item) => {
				return item;
			},
		},
		{
			title: "Nhãn hàng",
			dataIndex: "brand",
			key: "brand",
			width: 160,
			align: "center",
			render: (item) => {
				return item;
			},
		},
	];
	return (
		<>
			{!!showDetailWhBill?.show && (
				<WarehouseBillList
					idVariant={showDetailWhBill?.idVariant}
					skuVariant={showDetailWhBill?.skuVariant}
					stockAllocated={showDetailWhBill?.stock_allocated}
					currentSmeWarehouse={{
						id: showDetailWhBill?.sme_store_id,
						name: showDetailWhBill?.sme_store_name,
					}}
					onHide={() => {
						setShowDetailWhBill(null);
					}}
				/>
			)}
			<ModalCombo dataCombo={dataCombo} onHide={() => setDataCombo(null)} />
			{openDetailVariantUnit && <DetailsVariantUnit data={detailUnit} show={openDetailVariantUnit} onHide={() => setOpenDetailVariantUnit(false)} />}
			<Flex style={{ marginBottom: 8 }}>
				<Tabs
					onChange={(key) => {
						navigate(
							`${location.pathname}?${queryString.stringify(omit({
								...queryParams,
								type: key,
							}, ['page', 'limit']))}`
						);
					}}
					activeKey={params.get("type") || "all"}
					items={SUB_TABS?.map((sub_tab) => {
						if (sub_tab?.key == "all") {
							let total = agencyListInventoryItems?.agencyListInventoryItems?.meta?.total;
							return {
								...sub_tab,
								label: `${sub_tab?.label} (${formatNumberToCurrency(total)})`,
							};
						}
						let total = agencyListInventoryItems?.agencyListInventoryItems?.meta?.[`${sub_tab?.key}`];
						return {
							...sub_tab,
							label: `${sub_tab?.label} (${formatNumberToCurrency(total)})`,
						};
					})}
				/>
				<Flex justify="center" align="center" style={{ marginLeft: "auto" }}>
					<Flex justify="end" align="center">
						<Text style={{ marginRight: 8 }}>Sắp xếp theo:</Text>
						<div style={{ width: "230px", zIndex: 99, marginRight: 6 }} className="mr-3">
							<Select
								value={queryParams?.order_by || "stock_actual"}
								options={OPTION_ORDER_BY}
								style={{ width: "100%" }}
								size="middle"
								onChange={(value) => {
									navigate(
										`${location.pathname}?${queryString.stringify({
											...queryParams,
											page: 1,
											order_by: value,
										})}`
									);
								}}
							/>
						</div>

						<Flex
							align="center"
							justify="center"
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										...queryParams,
										page: 1,
										sort: "DESC",
									})}`
								);
							}}
							style={{ marginRight: 6, height: "30px", width: "30px", cursor: "pointer", border: queryParams?.sort != "ASC" ? "1px solid #FE5629" : "1px solid #D9D9D9" }}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sort-down" viewBox="0 0 16 16">
								<path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
							</svg>
						</Flex>

						<Flex
							justify="center"
							align="center"
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										...queryParams,
										page: 1,
										sort: "ASC",
									})}`
								);
							}}
							style={{ height: "30px", width: "30px", cursor: "pointer", border: queryParams?.sort == "ASC" ? "1px solid #FE5629" : "1px solid #D9D9D9" }}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sort-up" viewBox="0 0 16 16">
								<path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707V12.5zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
							</svg>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
			<Table
				className="upbase-table"
				columns={columns as any}
				dataSource={dataTable || []}
				bordered
				sticky={{ offsetHeader: 50 }}
				scroll={{ x: "max-content" }}
				pagination={false}
				tableLayout="fixed"
			/>
			{!!dataTable?.length && (
				<Pagination
					page={page}
					totalPage={totalPage}
					limit={limit}
					totalRecord={totalRecord}
					count={itemInventory?.sme_catalog_inventory_items?.length}
					basePath={location.pathname}
					options={[
						{ label: 25, value: 25 },
						{ label: 50, value: 50 },
						{ label: 100, value: 100 },
					]}
					style={{ zIndex: 1000 }}
				/>
			)}
		</>
	);
});

export default ProductStockTable;
