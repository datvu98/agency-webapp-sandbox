import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import queryString from "querystring";
import { ProductStockWrapper } from "./ProductStock.style";
import ProductStockFilter from "./components/ProductStockFilter";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import query_smeWarehouse from "graphql/queries/query_smeWarehouse";
import query_sme_brands from "graphql/queries/query_sme_brands";
import query_agencyListInventoryItems from "graphql/queries/query_agencyListInventoryItems";
import ProductStockTable from "./components/ProductStockTable";
import client from "apollo";
import query_sme_catalog_product_variant_stock from "graphql/queries/query_sme_catalog_product_variant_stock";
import mutate_agencyRequestExportInventoryItems from "graphql/mutations/mutate_agencyRequestExportInventoryItems";
import query_sme_product_status from "graphql/queries/query_sme_product_status";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
const { Text } = Typography;

const queryGetSmeProductVariants = async (ids) => {
	if (ids?.length == 0) return [];

	const { data } = await client.query({
		query: query_sme_catalog_product_variant_stock,
		variables: {
			where: {
				id: { _in: ids },
			},
		},
		fetchPolicy: "network-only",
	});

	return data?.sme_catalog_product_variant || [];
};

const querySmeStores = async (ids) => {
	if (ids?.length == 0) return [];

	const { data } = await client.query({
		query: query_smeWarehouse,
		variables: {
			where: {
				id: { _in: ids },
			},
		},
		fetchPolicy: "network-only",
	});

	return data?.sme_warehouses || [];
};

const ProductStock = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const { user } = useSelector(selectGlobalSlice);
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [sort, setSort] = useState("DESC");
	const [itemInventory, setItemInventory] = useState<any>([]);
	const [loading, setLoading] = useState(false);

	useLayoutEffect(() => {
		appendBreadcrumb([
			{
				title: "Quản lý kho"
			},
			{
				title: "Tồn kho"
			},
		]);
	}, []);

	const { data: dataSme, loading: loadingDataSme } = useQuery(query_agencyGetSme, {
		fetchPolicy: "cache-and-network",
	});
	const { data: statusData } = useQuery(query_sme_product_status, {
		variables: {
			order_by: [
				{
					sme_id: "desc",
				},
			],
		},
		fetchPolicy: "cache-and-network",
	});

	const [agencyRequestExportInventoryItems, { loading: loadingAgencyRequestExportInventoryItems }] = useMutation(mutate_agencyRequestExportInventoryItems, {
		awaitRefetchQueries: true,
		refetchQueries: ["agency_inventory_item_export_history"],
	});

	const { data: dataWarehouse, loading: loadingDataWarehouse } = useQuery(query_sme_warehouse_list, {
		variables: {
			where: {
				fulfillment_by: {
					_eq: 1,
				},
				status: {
					_eq: 10,
				},
			},
		},
		fetchPolicy: "cache-and-network",
	});

	const { data: dataBrand, loading: loadingBrand } = useQuery(query_sme_brands, {
		variables: {
			order_by: [
				{
					sme_id: "desc",
				},
			],
		},
		fetchPolicy: "cache-and-network",
	});

	useMemo(() => {
		setSort(params?.sort ?? "DESC");
	}, [params?.sort]);

	let page = useMemo(() => {
		try {
			let _page = Number(params?.page);
			if (!Number.isNaN(_page)) {
				return Math.max(1, _page);
			} else {
				return 1;
			}
		} catch (error) {
			return 1;
		}
	}, [params?.page]);
	let limit = useMemo(() => {
		try {
			let _value = Number(params?.limit);
			if (!Number.isNaN(_value)) {
				return Math.max(25, _value);
			} else {
				return 25;
			}
		} catch (error) {
			return 25;
		}
	}, [params?.limit]);
	let types = useMemo(() => {
		if (!params?.typeProduct) {
			return [];
		}
		return params?.typeProduct?.split(",");
	}, [params?.typeProduct]);

	let brandIds = useMemo(() => {
		if (!params?.brands) return [];
		return params?.brands?.split(",")?.map((item) => Number(item));
	}, [params?.brands]);

	let warehouseIds = useMemo(() => {
		if (!params?.warehouses) return [];
		return params?.warehouses?.split(",")?.map((item) => Number(item));
	}, [params?.warehouses]);

	let smeIds = useMemo(() => {
		if (!params?.ups) return [];
		return params?.ups?.split(",")?.map((item) => Number(item));
	}, [params?.ups]);

	let status = useMemo(() => {
		if (!params.type || params?.type == "all") {
			return null;
		}
		return params?.type;
	}, [params?.type]);

	let search = useMemo(() => {
		return params?.q || "";
	}, [params?.q]);

	const isProductStatus = useMemo(() => {
		if (params?.tab == "other") {
			return 1;
		}
		return 0;
	}, [params?.tab]);

	const productStatusIds = useMemo(() => {
		if (!!params?.productStatus) {
			return [Number(params?.productStatus)];
		}
		return [];
	}, [params?.productStatus]);

	const optionOrderBy = [
		{
			value: "stock_actual",
			label: "Tồn thực tế",
		},
	];

	const [orderBy, setOrderBy] = useState(optionOrderBy[0]);

	useMemo(() => {
		setOrderBy(optionOrderBy.find((element) => element.value == params?.order_by) ?? optionOrderBy[0]);
	}, [params?.order_by]);

	const variables = useMemo(() => {
		return {
			types,
			status,
			warehouseIds,
			brandIds,
			smeIds,
			limit,
			isProductStatus,
			offset: (page - 1) * limit,
			sort,
			search,
			orderBy: orderBy?.value,
			productStatusIds,
		};
	}, [types, status, warehouseIds, brandIds, smeIds, isProductStatus, limit, page, sort, orderBy, search, productStatusIds]);

	const { data: agencyListInventoryItems, loading: loadingAgencyListInventoryItems } = useQuery(query_agencyListInventoryItems, {
		variables,
		fetchPolicy: "cache-and-network",
		skip: !dataSme?.agencyGetSme,
		onCompleted: async (data) => {
			if (data?.agencyListInventoryItems?.data?.length > 0) {
				setLoading(true);
				const dataSmeVariants = await queryGetSmeProductVariants(data?.agencyListInventoryItems?.data?.map((item) => item?.variant_id));
				const dataWarehouse = await querySmeStores(data?.agencyListInventoryItems?.data?.map((item) => item?.sme_store_id));
				const mockInventory = data?.agencyListInventoryItems?.data?.map((item) => {
					return {
						...item,
						variant: dataSmeVariants?.find((_v) => _v?.id == item?.variant_id),
						sme_store: dataWarehouse?.find((wh) => wh?.id == item?.sme_store_id),
						sme: dataSme?.agencyGetSme?.find((sme) => sme?.sme_id == item?.sme_id),
					};
				});
				setItemInventory({ sme_catalog_inventory_items: mockInventory });
				setLoading(false);
			} else {
				setItemInventory([]);
			}
		},
	});

	const handleExport = async () => {
		let { data } = await agencyRequestExportInventoryItems({
			variables: {
				types,
				status,
				warehouseIds,
				brandIds,
				smeIds,
				isProductStatus,
				sort,
				orderBy: orderBy?.value,
				search,
				productStatusIds,
			},
		});
		if (data?.agencyRequestExportInventoryItems?.success) {
			showAlert.success("Gửi yêu cầu xuất file thành công");
			navigate("/warehouse-manage/history-export-product-stock");
		} else {
			showAlert.error(data?.agencyRequestExportInventoryItems?.message || "Gửi yêu cầu xuất file thành công");
		}
	};
	console.log(agencyListInventoryItems);
	return (
		<ProductStockWrapper>
			<Helmet titleTemplate="Tồn kho" defaultTitle="Tồn kho">
				<meta name="description" content="Tồn kho" />
			</Helmet>
			<Spin spinning={loadingBrand || loadingDataSme || loadingDataWarehouse || loadingAgencyListInventoryItems || loading}>
				<Card>
					<ProductStockFilter
						dataSme={dataSme}
						dataWarehouse={dataWarehouse}
						dataBrand={dataBrand}
						agencyListInventoryItems={agencyListInventoryItems}
						onExport={handleExport}
						statusData={statusData}
					/>
					<ProductStockTable page={page} limit={limit} agencyListInventoryItems={agencyListInventoryItems} itemInventory={itemInventory} />
				</Card>
			</Spin>
		</ProductStockWrapper>
	);
};

export default ProductStock;
