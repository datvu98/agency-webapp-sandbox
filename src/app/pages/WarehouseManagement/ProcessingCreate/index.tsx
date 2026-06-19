import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Form } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { ProcessingCreateWrapper } from "../Warehouse.styles";
import queryString from "querystring";
import dayjs from "dayjs";
import SectionAction from "./components/SectionAction";
import SectionFilter from "./components/SectionFilter";
import SectionTable from "./components/SectionTable";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import query_store_channel from "graphql/queries/query_store_channel";
import query_coGetShippingCarrierFromListPackage from "graphql/queries/query_coGetShippingCarrierFromListPackage";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";
import query_scSfPackageCount from "graphql/queries/query_scSfPackageCount";
import query_warehouseBillIsSioCount from "graphql/queries/query_warehouseBillIsSioCount";
import { orderBy } from "lodash";
import mutate_processingListCreate from "graphql/mutations/mutate_processingListCreate";
import ModalResult from "./dialogs/ModalResult";
import query_smeStore from "graphql/queries/query_smeStore";

const { Text } = Typography;

const ProcessingCreate = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const { user } = useSelector(selectGlobalSlice);
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [form] = Form.useForm();
	const [ids, setIds] = useState([]);
	const [smeWarehouse, setSmeWarehouse] = useState(null);
	const [searchParams, setSearchParams] = useState<any>([]);
	const [dataResults, setDataResults] = useState(null);
	const [filtersPackage, setFiltersPackage] = useState([
		{
			id: "range_time",
			type: "range_time",
			value: [dayjs().subtract(29, "d").startOf("day"), dayjs().endOf("day")],
		},
	]);
	const [filtersTable, setFiltersTable] = useState({
		page: 1,
		limit: 25,
		sort: "desc",
		order_by: "createdAt",
	});

	useLayoutEffect(() => {
		appendBreadcrumb([
			{ title: user?.category_code == 'fulfillment' ? "Vận hành xuất" :"Quản lý kho"},
			{
				title: "Tạo danh sách xử lý"
			},
		]);
	}, []);

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

	const { data: dataStore, loading: loadingDataStore } = useQuery(query_smeStore, {
		fetchPolicy: "cache-and-network",
	});

	const { data: dataShippingCarrierFromListPackage } = useQuery(query_coGetShippingCarrierFromListPackage, {
		variables: {
			is_connected: 1,
		},
		fetchPolicy: "cache-and-network",
	});

	const [getPackage, { data, loading: loadingGetPackages, error, refetch }] = useLazyQuery(query_warehouseBillListWithPagination, {
		fetchPolicy: "cache-and-network",
	});

	const [getPackageCount, { data: dataPackageCount }] = useLazyQuery(query_warehouseBillIsSioCount, {
		fetchPolicy: "cache-and-network",
	});

	const [mutateCreatePickup, { loading }] = useMutation(mutate_processingListCreate);

	const [optionsChannel, optionsStore] = useMemo(() => {
		const channels = dataStore?.op_connector_channels?.map((channel) => ({
			...channel,
			logo: channel?.logo_asset_url,
			value: channel?.code,
			label: channel?.name,
		}));

		const stores = dataStore?.scAgencySaleStores?.data?.map((store) => ({
			value: store?.id,
			label: store?.name,
			logo: dataStore?.op_connector_channels?.find((channel) => channel?.code == store?.connector_channel_code)?.logo_asset_url,
			...store,
		}));

		return [channels, stores];
	}, [dataStore]);

	const optionsSmeWarehouse = useMemo(() => {
		const optionsCatalogStores = dataWarehouse?.smeWarehouseByAgency?.data?.map((_store) => ({
			value: _store?.id,
			label: _store?.name,
			isDefault: _store?.is_default,
			..._store,
		}));

		return optionsCatalogStores;
	}, [dataWarehouse]);

	const optionsShippingUnit = useMemo(() => {
		const options = dataShippingCarrierFromListPackage?.coGetShippingCarrierFromListPackage?.data?.map((item) => ({
			...item,
			value: item?.shipping_carrier,
			label: item?.shipping_carrier,
		}));

		return options || [];
	}, [dataShippingCarrierFromListPackage]);

	const onSearch = async (_filtersTable = null) => {
		const __filtersTable = _filtersTable ?? filtersTable;
		const _filtersPackage = filtersPackage.map((item) => ({ ...item, valueActive: item?.value }));
		setFiltersPackage(_filtersPackage);
		let search = {};

		if (!!smeWarehouse) {
			search = {
				...search,
				warehouseId: {
					_eq: smeWarehouse,
				},
				processingListId: { _is_null: true },
				type: {
					_eq: "out",
				},
				status: {
					_eq: "new",
				},
			};
		}
		(_filtersPackage || []).forEach((pk: any) => {
			if (!pk?.valueActive) return;
			if (pk?.type == "range_time") {
				search = {
					...search,
					createdAt: {
						_gt: dayjs(pk?.valueActive?.[0]).toISOString(),
						_lt: dayjs(pk?.valueActive?.[1]).toISOString(),
					},
				};
			}

			if (pk?.type == "shippingCarrier") {
				search = {
					...search,
					shippingCarrier: {
						_eq: pk?.valueActive?.value,
					},
				};
			}

			if (pk?.type == "channelCode") {
				search = {
					...search,
					...(pk?.valueActive?.length
						? {
								channelCode: {
									_in: pk?.valueActive?.map((item: any) => item?.value),
								},
						  }
						: {}),
				};
			}

			if (pk?.type == "storeId") {
				search = {
					...search,
					...(pk?.valueActive?.length
						? {
								storeId: {
									_in: pk?.valueActive?.map((item: any) => item?.value),
								},
						  }
						: {}),
				};
			}

			if (pk?.type == "orderCode") {
				search = {
					...search,
					orderCode: {
						_in: pk?.valueActive?.split(","),
					},
				};
			}

			if (pk?.type == "code") {
				search = {
					...search,
					code: {
						_in: pk?.valueActive?.split(","),
					},
				};
			}

			if (pk?.type == "warehouseBillItem.variant.sku") {
				search = {
					...search,
					warehouseBillItems: {
						variant: {
							sku: {
								_in: pk?.valueActive.split(","),
							},
						},
					},
				};
			}

			if (pk?.type == "shipExpiredAt") {
				search = {
					...search,
					shipExpiredAt: {
						_gt: dayjs(pk?.valueActive?.[0]).toISOString(),
						_lt: dayjs(pk?.valueActive?.[1]).toISOString(),
					},
				};
			}

			if (pk?.type == "type") {
				search = {
					...search,
					...(pk?.valueActive?.value
						? {
								isSIO: {
									_eq: pk?.valueActive?.value == 1 ? true : false,
								},
						  }
						: {}),
				};
			}

			if (pk?.type == "milestone") {
				search = {
					...search,
					...(pk?.valueActive?.length
						? {
								deadlineMilestone: {
									_in: pk?.valueActive?.map((item: any) => item?.value),
								},
						  }
						: {}),
				};
			}
			if (pk?.type == "protocol") {
				search = {
					...search,
					...(pk?.valueActive?.length
						? {
								protocol: {
									_in: pk?.valueActive?.map((item: any) => Number(item?.value)),
								},
						  }
						: {}),
				};
			}
		});
		setSearchParams(search);
		getPackage({
			variables: {
				offset: (__filtersTable?.page - 1) * __filtersTable?.limit,
				limit: +__filtersTable?.limit,
				orderBy: {
					[__filtersTable?.order_by]: __filtersTable?.sort,
				},
				where: {
					...search,
				},
			},
		});

		if (!_filtersTable) {
			getPackageCount({
				variables: {
					where: {
						...search,
					},
				},
			});
		}
	};

	const onCreateOrderFulfillment = useCallback(
		async (values, total, isCreateFilter, cb, isCheckConfig = true) => {
			try {
				const warehouse = optionsSmeWarehouse?.find((wh) => wh?.value == values?.smeWarehouse);
				// if (isCheckConfig && (!warehouse?.max_mio || !warehouse?.max_sio || !warehouse?.max_mixio)) {
				// 	setConfigWarehouse({ values, total, isCreateFilter, cb, isCheckConfig: false });
				// 	return;
				// }

				const { data } = await mutateCreatePickup({
					variables: {
						data: {
							warehouseId: searchParams?.warehouseId?._eq,
							note: values?.session_pickup_note,
							types: values?.session_pickup_type == "grp" ? values?.session_sub_pickup_type?.map((item) => item?.toUpperCase()) : [values?.session_pickup_type?.toUpperCase()],
						},
						where: {
							...searchParams,

							...(!isCreateFilter
								? {
										id: {
											_in: ids?.map((item: any) => Number(item?.id)),
										},
								  }
								: {}),
						},
					},
				});

				if (data?.processingListCreate) {
					cb();
					if (!data?.processingListCreate?.success) {
						showAlert.error(data?.processingListCreate?.message);
					} else setDataResults(data?.processingListCreate?.data);
				} else {
					showAlert.error("Tạo danh sách xử lý đơn thất bại");
				}
			} catch (error) {
				showAlert.error("Có lỗi xảy ra, xin vui lòng thử lại");
			}
		},
		[ids, searchParams, optionsSmeWarehouse]
	);

	return (
		<ProcessingCreateWrapper>
			<ModalResult
				result={dataResults}
				onHide={() => {
					setDataResults(null);
					navigate(`/${user?.category_code == 'fulfillment' ? "outbound-manage" : 'warehouse-manage'}/processing-list`);
				}}
			/>
			<Helmet titleTemplate="Tạo danh sách xử lý" defaultTitle="Tạo danh sách xử lý">
				<meta name="description" content="Tạo danh sách xử lý" />
			</Helmet>
			<Spin spinning={loadingDataStore || loadingDataWarehouse || loadingGetPackages || loading}>
				<Form form={form} name="basic" layout="vertical" initialValues={{ session_pickup_type: "grp", session_sub_pickup_type: ["mio", "sio"] }}>
					<Row gutter={10}>
						<Col span={16}>
							<Card className="card-switch" title={false}>
								<SectionFilter
									onSearch={onSearch}
									form={form}
									setIds={setIds}
									filtersPackage={filtersPackage}
									setFiltersPackage={setFiltersPackage}
									optionsSmeWarehouse={optionsSmeWarehouse}
									optionsChannel={optionsChannel}
									optionsStore={optionsStore}
									optionsShippingUnit={optionsShippingUnit}
									smeWarehouse={smeWarehouse}
									setSmeWarehouse={setSmeWarehouse}
								/>
								<SectionTable
									ids={ids}
									setIds={setIds}
									optionsSmeWarehouse={optionsSmeWarehouse}
									optionsChannel={optionsChannel}
									optionsStore={optionsStore}
									filtersTable={filtersTable}
									loading={loadingGetPackages}
									data={data}
									updateFilter={(_) => {
										onSearch(_);
										console.log(_);
										setFiltersTable(_);
									}}
									error={error}
									refetch={refetch}
								/>
							</Card>
						</Col>
						<Col span={8}>
							<SectionAction onCreateOrderFulfillment={onCreateOrderFulfillment} data={dataPackageCount} form={form} ids={ids} />
						</Col>
					</Row>
				</Form>
			</Spin>
		</ProcessingCreateWrapper>
	);
};

export default ProcessingCreate;
