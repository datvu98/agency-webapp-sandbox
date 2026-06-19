import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { WarehouseListWraper } from "../Warehouse.styles";
import WarehouseListFilter from "./components/WarehouseListFilter";
import queryString from "querystring";
import WarehouseListTable from "./components/WarehouseListTable";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";

const { Text } = Typography;

const WarehouseList = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const { user } = useSelector(selectGlobalSlice);
	const params = queryString.parse(location.search.slice(1, 100000)) as any;

	useLayoutEffect(() => {
		appendBreadcrumb([
			{
				title: "Quản lý kho"
			},
			{
				title: "Danh sách kho"
			},
		]);
	}, []);

	const page = useMemo(() => {
		try {
			let _page = Number(params.page);
			if (!Number.isNaN(_page)) {
				return Math.max(1, _page);
			} else {
				return 1;
			}
		} catch (error) {
			return 1;
		}
	}, [params.page]);

	const limit = useMemo(() => {
		try {
			let _value = Number(params.limit);
			if (!Number.isNaN(_value)) {
				return Math.max(25, _value);
			} else {
				return 25;
			}
		} catch (error) {
			return 25;
		}
	}, [params?.limit]);
	const searchText = useMemo(() => {
		if (params?.q) {
			return { name: { _ilike: `%${params?.q}%` } };
		}
		return {};
	}, [params.q]);
	const {
		data: dataWarehouse,
		loading,
		error,
		refetch,
	} = useQuery(query_sme_warehouse_list, {
		fetchPolicy: "network-only",
		variables: {
			limit,
			offset: (page - 1) * limit,
			order_by: {
				created_at: "desc",
			},
			where: { ...searchText },
		},
	});

	return (
		<WarehouseListWraper>
			<Helmet titleTemplate="Danh sách kho" defaultTitle="Danh sách kho">
				<meta name="description" content="Danh sách kho" />
			</Helmet>
			<Spin spinning={false}>
				<Card className="card-switch" title={false}>
					<WarehouseListFilter />
					<WarehouseListTable dataWarehouse={dataWarehouse} error={error} loading={loading} refetch={refetch} />
				</Card>
			</Spin>
		</WarehouseListWraper>
	);
};

export default WarehouseList;
