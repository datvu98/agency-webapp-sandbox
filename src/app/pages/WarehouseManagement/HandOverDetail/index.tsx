import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import queryString from "querystring";
import GeneralInfo from "./components/GeneralInfo";
import DetailTable from "./components/DetailTable";
import SectionHistory from "./components/SectionHistory";
import query_handoverListGetById from "graphql/queries/query_handoverListGetById";
import query_handoverListItemListWithPagination from "graphql/queries/query_handoverListItemListWithPagination";
import { queryWarehouseBillByIds } from "../PackingDetail/helpers";
import query_printMinutesHandoverList from "graphql/queries/query_printMinutesHandoverList";
import ModalInfo from "./dialogs/ModalInfo";
import mutate_endHandover from "graphql/mutations/mutate_endHandover";
import query_workSessionWithPagination from "graphql/queries/query_workSessionWithPagination";
import query_agencyGetSubUsers from "graphql/queries/query_agencyGetSubUsers";

const { Text } = Typography;

const mockData = {
	code: "JTE568907HNJRT",
	packageQuantity: 100,
	status: "Đang bàn giao",
	shippingCarrier: "SPX Express",
	dataTable: [
		{
			warehouseBillCode: "JTE568907HNJRT",
			packageNum: "JTE568907HNJRT",
			trackingNumber: "JTE568907HNJRT",
			totalVariant: 100,
			quantity: 100,
		},
		{
			warehouseBillCode: "JTE568907HNJRT",
			packageNum: "JTE568907HNJRT",
			trackingNumber: "JTE568907HNJRT",
			totalVariant: 100,
			quantity: 100,
		},
	],
};

const HandOverDetail = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const { user } = useSelector(selectGlobalSlice);
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const { id } = useParams();

	const [dataTable, setDataTable] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showInfo, setShowInfo] = useState({
		show: false,
		dataInfo: {},
		url: "",
	});
	useLayoutEffect(() => {
		appendBreadcrumb([
			{ title: user?.category_code == 'fulfillment' ? "Vận hành xuất" :"Quản lý kho"},
			{
				title: "Chi tiết phiếu bàn giao"
			},
		]);
	}, []);

	const [printMinutesHandoverList, { loading: loadingPrintMinutesHandoverList }] = useLazyQuery(query_printMinutesHandoverList, {
		fetchPolicy: "cache-and-network",
	});

	const [endHandover, { loading: loadingEndHandover }] = useMutation(mutate_endHandover, {
		awaitRefetchQueries: true,
		refetchQueries: ['handoverListGetById']
	});

	const { data: agencyGetSubUsers, loading: loadingAgencyGetSubUsers } = useQuery(query_agencyGetSubUsers, {
		variables: {
			page: 1,
			pageSize: 1000,
		},
		fetchPolicy: "cache-and-network",
	});

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

	const search = useMemo(() => {
		if (!params?.q) return {};
		return {
			warehouseBill: {
				_or: [
					{
						code: {
							_ilike: `%${params?.q}%`,
						},
					},
					{
						trackingNumber: {
							_ilike: `%${params?.q}%`,
						},
					},
					{
						systemPackageNumber: {
							_ilike: `%${params?.q}%`,
						},
					},
				],
			},
		};
	}, [params?.q]);

	const { data: dataHandoverDetail, loading: loadingDataHandoverDetail } = useQuery(query_handoverListGetById, {
		variables: {
			id: Number(id),
		},
		fetchPolicy: "cache-and-network",
		skip: !id,
	});

	const { data: dataWorkSession, loading: loadingDataWorkSession } = useQuery(query_workSessionWithPagination, {
		variables: {
			where: {
				work: {
					targetId: {
						_eq: Number(id)
					},
				},
			}
		},
		fetchPolicy: "cache-and-network",
		skip: !id,
	});
	const { data: dataHandoverItems, loading: loadingDataHandoverItems } = useQuery(query_handoverListItemListWithPagination, {
		variables: {
			limit,
			offset: (page - 1) * limit,
			where: {
				handoverListId: {
					_eq: Number(id),
				},
				...search,
				status: {
					_nin: ['CANCEL']
				}
			},
		},
		fetchPolicy: "cache-and-network",
		skip: !id,
		onCompleted: async (data) => {
			setLoading(true);
			const listWarehouseBillIds = data?.handoverListItemListWithPagination?.data?.map((item) => item?.warehouseBillId);
			let listWarehouseBill = await queryWarehouseBillByIds(listWarehouseBillIds);
			const newData = data?.handoverListItemListWithPagination?.data?.map((item) => ({
				...item,
				warehouseBill: listWarehouseBill?.find((bill) => bill?.id == item?.warehouseBillId),
			}));
			setDataTable(newData);
			setLoading(false);
		},
	});

	const handlePrint = async () => {
		let { data: dataPrint } = await printMinutesHandoverList({
			variables: {
				handoverListId: Number(id),
			},
		});
		if (dataPrint?.printMinutesHandoverList?.success) {
			if (dataPrint?.printMinutesHandoverList?.data?.canceledItems?.length) {
				setShowInfo({
					show: true,
					dataInfo: dataPrint?.printMinutesHandoverList?.data?.canceledItems,
					url: dataPrint?.printMinutesHandoverList?.data?.url,
				});
			} else {
				window.open(`${dataPrint?.printMinutesHandoverList?.data?.url}`);
			}
		} else {
			showAlert.error(dataPrint?.printMinutesHandoverList?.message || "In biên bản bàn giao thất bại");
		}
	};

	const handleComplete = async () => {
		let { data: dataComplete } = await endHandover({
			variables: {
				handoverListId: Number(id),
			},
		});
		if (dataComplete?.endHandover?.success) {
			if (dataComplete?.endHandover?.data?.canceledItems?.length) {
				setShowInfo({
					show: true,
					dataInfo: dataComplete?.endHandover?.data?.canceledItems,
					url: '',
				});
			} 
			showAlert.success("Hoàn thành phiên bàn giao thành công");
		} else {
			showAlert.error(dataComplete?.endHandover?.message || "Hoàn thành phiên bàn giao thất bại");
		}
	}
	const optionSubUsers = useMemo(() => {
		if (!agencyGetSubUsers?.agencyGetSubUsers?.items) return [];
		return agencyGetSubUsers?.agencyGetSubUsers?.items?.map((user) => ({
			value: user?.id,
			label: user?.username,
		}));
	}, [agencyGetSubUsers]);
	return (
		<>
			<Helmet titleTemplate="Chi tiết phiếu bàn giao" defaultTitle="Chi tiết phiếu bàn giao">
				<meta name="description" content="Chi tiết phiếu bàn giao" />
			</Helmet>
			{showInfo?.show && (
				<ModalInfo
					show={showInfo?.show}
					dataInfo={showInfo?.dataInfo}
					onHide={() => {
						setShowInfo({
							show: false,
							dataInfo: {},
							url: "",
						});
					}}
					onConfirm={() => { 
						if (!!showInfo?.url?.length) {
							window.open(`${showInfo?.url}`);
						}
						setShowInfo({
							show: false,
							dataInfo: {},
							url: "",
						});
					}}
				/>
			)}
			<Spin spinning={loadingDataHandoverDetail || loadingDataHandoverItems || loading || loadingPrintMinutesHandoverList || loadingEndHandover || loadingAgencyGetSubUsers}>
				<Card>
					<Row gutter={10}>
						<Col span={18}>
							<GeneralInfo dataDetail={dataHandoverDetail?.handoverListGetById?.data} />
							<DetailTable 
								dataTable={dataTable} 
								dataPagination={dataHandoverItems?.handoverListItemListWithPagination?.meta} onPrint={handlePrint} 
								dataDetail={dataHandoverDetail?.handoverListGetById?.data}
								onComplete={handleComplete}
							/>
						</Col>
						<Col span={6}>
							<SectionHistory dataDetail={dataWorkSession?.workSessionWithPagination?.data} optionSubUsers={optionSubUsers}/>
						</Col>
					</Row>
				</Card>
			</Spin>
		</>
	);
};

export default HandOverDetail;
