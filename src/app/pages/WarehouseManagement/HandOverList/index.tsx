import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Tabs } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useLocation, useNavigate } from "react-router-dom";
import { usePostHog } from '@posthog/react';
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import queryString from "querystring";
import HandOverListFilter from "./components/HandOverListFilter";
import HandOverListTable from "./components/HandOverListTable";
import query_agencyGetSubUsers from "graphql/queries/query_agencyGetSubUsers";
import { HandOverWrapper } from "../Warehouse.styles";
import dayjs from "dayjs";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import CancelHandoverFilter from "./components/CancelHandoverFilter";
import CancelHanoverTable from "./components/CancelHandoverTable";
import { TABS } from "./constant";
import AbnormalFilter from "./components/AbnormalFilter";
import AbnormalTable from "./components/AbnormalTable";

const { Text } = Typography;


const HandOverList = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const location = useLocation();
	const posthog = usePostHog();
	const { user } = useSelector(selectGlobalSlice);
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [dataTable, setDataTable] = useState([])

	useLayoutEffect(() => {
		appendBreadcrumb([
			{ title: user?.category_code == 'fulfillment' ? "Vận hành xuất" :"Quản lý kho"},
			{ title: user?.category_code == 'fulfillment' ? "Bàn giao xuất hàng" :"Quản lý bàn giao"},
		]);
	}, []);

	const { data: agencyGetSubUsers, loading: loadingAgencyGetSubUsers } = useQuery(query_agencyGetSubUsers, {
		variables: {
			page: 1,
			pageSize: 1000,
		},
		fetchPolicy: "cache-and-network",
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

	const optionSubUsers = useMemo(() => {
		if (!agencyGetSubUsers?.agencyGetSubUsers?.items) return [];
		return agencyGetSubUsers?.agencyGetSubUsers?.items?.map((user) => ({
			value: user?.id,
			label: user?.username,
		}));
	}, [agencyGetSubUsers]);

	const optionsWarehouse = useMemo(() => {
		if (!dataWarehouse) return [];
		return dataWarehouse?.smeWarehouseByAgency?.data?.map((wh) => ({
			label: wh?.name,
			value: wh?.id,
			is_default: wh?.is_default,
		}));
	}, [dataWarehouse]);

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

	const status = useMemo(() => {
		if (!params?.status) return {}
		return {
			status: {
				_eq: params?.status
			}
		}
	}, [params?.status]);

	const shippingCarrier = useMemo(() => {
		if (!params?.shippingCarrier) return {}
		return {
			shippingCarrierCode: {
				_in: params?.shippingCarrier?.split(',')
			}
		}
	}, [params?.shippingCarrier]);

	const warehouseId = useMemo(() => {
		if (!params?.warehouses) return {}
		return {
			warehouseId: {
				_in: params?.warehouses?.split(',')?.map(item => Number(item))
			}
		}
	}, [params?.warehouses]);

	const timeFilter = useMemo(() => {
		if (!params?.date_search_type) {
			return {
				createdAt: {
					_gt: params?.gt ? dayjs.unix(+params?.gt).toISOString() : dayjs().startOf('day').toISOString(),
					_lt: params?.lt ? dayjs.unix(+params?.lt).toISOString() : dayjs().endOf('day').toISOString()
				}
			}
		}
		return {
			[`${params?.date_search_type}`]: {
				_gt: params?.gt ? dayjs.unix(+params?.gt).toISOString() : dayjs().startOf('day').toISOString(),
				_lt: params?.lt ? dayjs.unix(+params?.lt).toISOString() : dayjs().endOf('day').toISOString()
			}
		}
	}, [params?.date_search_type, params?.gt, params?.lt]);

	const search = useMemo(() => {
		if (!params?.q) return {}
		return { _or: [
			{code: {
				_ilike: `%${params?.q}%`
			}},
			{
				items: {
					warehouseBill: {
						_or: [
							{
								trackingNumber: {
									_ilike: `%${params?.q}%`
								}
							},
							{
								code: {
									_ilike: `%${params?.q}%`
								}
							},
							{
								systemPackageNumber: {
									_ilike: `%${params?.q}%`
								}
							}
						]
					}
				}
			}
		]}
	}, [params?.q]);

	const variables = useMemo(() => {
		return {
			limit,
			offset: (page-1)*limit,
			where: {
				...status,
				...shippingCarrier,
				...timeFilter,
				...search,
				...warehouseId,
			}
		}
	}, [limit, page, status, shippingCarrier, timeFilter, search, warehouseId])

	return (
        <HandOverWrapper>
			<Helmet titleTemplate={user?.category_code == 'fulfillment' ? "Bàn giao xuất hàng" :"Quản lý bàn giao"} defaultTitle={user?.category_code == 'fulfillment' ? "Bàn giao xuất hàng" :"Quản lý bàn giao"}>
				<meta name="description" content={user?.category_code == 'fulfillment' ? "Bàn giao xuất hàng" :"Quản lý bàn giao"} />
			</Helmet>
            
			<Spin spinning={loadingAgencyGetSubUsers}>
				<Tabs
					onChange={(key) => {
						posthog?.capture('handover_tab_changed', { tab: key });
						navigate(`${location.pathname}?${queryString.stringify({
							tab: key,
						})}`);
					}}
					activeKey={params.tab || "handover"}
					items={TABS}
				/>
                <Card>
					{(!params?.tab || params?.tab == 'handover') && <>
						<HandOverListFilter optionsWarehouse={optionsWarehouse}/>
                    	<HandOverListTable variables={variables} optionSubUsers={optionSubUsers} optionsWarehouse={optionsWarehouse}/>
					</>}
                    {params?.tab == 'cancelHandover' &&<>
						<CancelHandoverFilter optionsWarehouse={optionsWarehouse}/>
						<CancelHanoverTable optionsWarehouse={optionsWarehouse}/>
					</>}
					{params?.tab == 'abnormal' &&<>
						<AbnormalFilter optionsWarehouse={optionsWarehouse}/>
						<AbnormalTable optionsWarehouse={optionsWarehouse}/>
					</>}
                    
                </Card>
			</Spin>
        </HandOverWrapper>
	);
};

export default HandOverList;
