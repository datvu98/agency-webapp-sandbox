import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { ProcessingListWrapper, WarehouseListWraper } from "../Warehouse.styles";
import queryString from "querystring";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import ProcessingListFilter from "./components/ProcessingListFilter";
import ProcessingListTable from "./components/ProcessingListTable";
import query_processingListListWithPagination from "graphql/queries/query_processingListListWithPagination";
import dayjs from "dayjs";
import Pagination from "app/components/Pagination";
import query_agencyGetSubUsers from "graphql/queries/query_agencyGetSubUsers";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import query_processingListStatusCount from "graphql/queries/query_processingListStatusCount";
import mutate_processingListCreatePickStepBulk from "graphql/mutations/mutate_processingListCreatePickStepBulk";

const { Text } = Typography;

const ProcessingList = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const { user } = useSelector(selectGlobalSlice);
	const [ids, setIds] = useState([])

	useLayoutEffect(() => {
		appendBreadcrumb([
			{ title: user?.category_code == 'fulfillment' ? "Vận hành xuất" :"Quản lý kho"},
			{
				title: "Danh sách xử lý"
			},
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
	const { data: dataSmes } = useQuery(query_agencyGetSme, {
		fetchPolicy: "cache-and-network",
	});

	const [processingListCreatePickStepBulk, {loading: loadingProcessingListCreatePickStepBulk}] = [async () => ({}), {loading: false}];

	const optionSubUsers = useMemo(() => {
		if (!agencyGetSubUsers?.agencyGetSubUsers?.items) return [];
		return agencyGetSubUsers?.agencyGetSubUsers?.items?.map((user) => ({
			value: `${user?.id}`,
			label: user?.username,
			is_subuser: 1,
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

	const optionSmes = useMemo(() => {
		if (!dataSmes?.agencyGetSme) return [];
		return dataSmes?.agencyGetSme?.map((sme) => ({
			...sme,
			value: sme?.sme_id,
			label: `${sme?.sme_id} - ${sme?.full_name}`,
		}));
	}, [dataSmes]);

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
			return { code: { _ilike: `%${params?.q}%` } };
		}
		return {};
	}, [params.q]);

	const createdById = useMemo(() => {
		if (params?.createBy) {
			return {
				createdById: {
					_in: params?.createBy?.split(",")?.map((item) => {
						if (item?.includes("admin_")) {
							return Number(item?.split("_")?.[1]);
						}
						return Number(item);
					}),
				},
			};
		}
		return {};
	}, [params.createBy]);

	const picId = useMemo(() => {
		if (params?.staff) {
			return {
				picId: {
					_in: params?.staff?.split(",")?.map((item) => {
						if (item?.includes("admin_")) {
							return Number(item?.split("_")?.[1]);
						}
						return Number(item);
					}),
				},
			};
		}
		return {};
	}, [params.staff]);

	const smeIds = useMemo(() => {
		if (params?.ups) {
			return { smeIds: { _contains: params?.ups?.split(",")?.map((item) => Number(item)) } };
		}
		return {};
	}, [params.ups]);

	const warehouseId = useMemo(() => {
		if (params?.warehouses) {
			return { warehouseId: { _in: params?.warehouses?.split(",")?.map((item) => Number(item)) } };
		}
		return {};
	}, [params.warehouses]);

	const status = useMemo(() => {
		if (params?.tab && params?.tab != "all") {
			return { status: { _eq: params?.tab } };
		}
		return {};
	}, [params.tab]);

	const createdAt = useMemo(() => {
		try {
			if (!params.gt || !params.lt)
				return {
					createdAt: {
						_gt: dayjs().subtract(6, "day").startOf("day").toISOString(),
						_lt: dayjs().endOf("day").toISOString(),
					},
				};

			return {
				createdAt: { _gt: dayjs.unix(Number(params?.gt)).toISOString(), _lt: dayjs.unix(Number(params?.lt)).toISOString() },
			};
		} catch (error) {
			return {};
		}
	}, [params?.gt, params?.lt]);
	const {
		data: processingListListWithPagination,
		loading,
		error,
		refetch,
	} = useQuery(query_processingListListWithPagination, {
		fetchPolicy: "network-only",
		variables: {
			limit,
			offset: (page - 1) * limit,
			where: {
				...searchText,
				...createdById,
				...picId,
				...smeIds,
				...warehouseId,
				...createdAt,
				...status,
			},
		},
	});

	const { data: processingListStatusCount, loading: loadingCount } = useQuery(query_processingListStatusCount, {
		fetchPolicy: "network-only",
		variables: {
			where: {
				...searchText,
				...createdById,
				...picId,
				...smeIds,
				...warehouseId,
				...createdAt,
			},
		},
	});

	

	return (
		<ProcessingListWrapper>
			<Helmet titleTemplate="Danh sách xử lý" defaultTitle="Danh sách xử lý">
				<meta name="description" content="Danh sách xử lý" />
			</Helmet>
			<Spin spinning={loading || loadingCount || loadingProcessingListCreatePickStepBulk}>
				<Card className="card-switch" title={false}>
					<ProcessingListFilter optionSmes={optionSmes} optionsWarehouse={optionsWarehouse} optionPIC={optionSubUsers} ids={ids} processingListCreatePickStepBulk={processingListCreatePickStepBulk} setIds={setIds} />
					<ProcessingListTable
						dataTable={processingListListWithPagination?.processingListListWithPagination?.data || []}
						dataCount={processingListStatusCount}
						dataPagination={processingListListWithPagination?.processingListListWithPagination?.meta || {}}
						refetch={refetch}
						error={error}
						optionSmes={optionSmes}
						optionsWarehouse={optionsWarehouse}
						optionPIC={optionSubUsers}
						ids={ids}
						setIds={setIds}
						
					/>
				</Card>
			</Spin>
		</ProcessingListWrapper>
	);
};

export default ProcessingList;
