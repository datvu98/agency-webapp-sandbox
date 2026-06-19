import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Tag, Tabs } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { ProcessingDetailWrapper, WarehouseListWraper } from "../Warehouse.styles";
import queryString from "querystring";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import query_agencyGetSubUsers from "graphql/queries/query_agencyGetSubUsers";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import query_processingListGetById from "graphql/queries/query_processingListGetById";
import { TABS } from "../ProcessingList/constants";
import GeneralInfo from "./components/GeneralInfo";
import WarehouseInfo from "./components/WarehouseInfo";
import PrintStatusInfo from "./components/PrintStatusInfo";
import { TABS_DETAIL } from "./constants";
import OutboundTable from "./components/OutboundTable";
import VariantTable from "./components/VariantTable";
import mutate_processingListCreatePickStep from "graphql/mutations/mutate_processingListCreatePickStep";
import { showAlert } from "utils/helper";
import ModalConfirm from "../ProcessingList/dialogs/ModalConfirm";
import AssignPICDialog from "../ProcessingList/dialogs/AssignPICDialog";
import mutate_processingListCancel from "graphql/mutations/mutate_processingListCancel";

const { Text } = Typography;

const ProcessingDetail = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const { user } = useSelector(selectGlobalSlice);
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const { id } = useParams();

	const [showConfirm, setShowConfirm] = useState<any>({
		show: false,
		id: null
	})
	const [showAssign, setShowAssign] = useState<any>({
		show: false,
		id: null
	})
	useLayoutEffect(() => {
		appendBreadcrumb([
			{ title: user?.category_code == 'fulfillment' ? "Vận hành xuất" :"Quản lý kho"},
			{
				title: "Danh sách xử lý xuất kho"
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

	const { data: processingListGetById, loading: loadingProcessingListGetById } = useQuery(query_processingListGetById, {
		variables: {
			id: Number(id),
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

	const [processingListCreatePickStep, {loading: loadingProcessingListCreatePickStep}] = useMutation(mutate_processingListCreatePickStep, {
		awaitRefetchQueries: true,
		refetchQueries: ['processingListGetById']
	})

	const [processingListCancel, {loading: loadingProcessingListCancel}] = useMutation(mutate_processingListCancel, {
			awaitRefetchQueries: true,
			refetchQueries: ['processingListGetById']
		})
	
	const optionSubUsers = useMemo(() => {
		if (!agencyGetSubUsers?.agencyGetSubUsers?.items) return [];
		return agencyGetSubUsers?.agencyGetSubUsers?.items?.map((user) => ({
			value: user?.id,
			label: user?.username,
			is_subuser: 1
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

	const viewStatus = useMemo(() => {
		let color = "#FF5629";
		if (processingListGetById?.processingListGetById?.data?.status == "NEW") color = "#00DB6D";
		if (processingListGetById?.processingListGetById?.data.status == "PACKED") color = "#0D6EFD";
		if (processingListGetById?.processingListGetById?.data?.status == "CANCELLED") color = "#F80D0D";

		return <Tag color={color}>{TABS?.find((item) => item?.key == processingListGetById?.processingListGetById?.data?.status)?.label}</Tag>;
	}, [processingListGetById?.processingListGetById]);

	return (
		<ProcessingDetailWrapper>
			<Helmet titleTemplate="Danh sách xử lý xuất kho" defaultTitle="Danh sách xử lý xuất kho">
				<meta name="description" content="Danh sách xử lý xuất kho" />
			</Helmet>
			{showConfirm?.show && <ModalConfirm
				show={showConfirm?.show}
				onHide={() => {
					setShowConfirm({
						show: false,
						id: null
					})
				}}
				onConfirm={async () => {
					setShowConfirm(prev => ({
						...prev, 
						show: false
					}))
					let {data} = await processingListCancel({
						variables: {
							id: showConfirm?.id
						}
					})
					if (data?.processingListCancel?.success) {
						showAlert.success('Huỷ danh sách xử lý thành công')
					} else {
						showAlert.error(data?.processingListCancel?.message || 'Huỷ danh sách xử lý thất bại')
					}
					
				}}
			/>}
			{showAssign?.show && <AssignPICDialog
				show={showAssign?.show}
				onHide={() => {
					setShowAssign({
						show: false,
						id: null
					})
				}}
				id={showAssign?.id || 0}
				optionPIC={optionSubUsers}
			/>}
			<Spin spinning={loadingProcessingListGetById || loadingProcessingListCancel ||loadingProcessingListCreatePickStep}>
				<Flex align="center" gap={10} style={{ marginBottom: 10 }}>
					<Text>Mã danh sách: {processingListGetById?.processingListGetById?.data?.code || "--"}</Text>
					{viewStatus}
				</Flex>
				<Row gutter={10} style={{ marginBottom: 10 }}>
					<Col span={12}>
						<GeneralInfo data={processingListGetById} />
					</Col>
					<Col span={12}>
						<WarehouseInfo data={processingListGetById} optionsWarehouse={optionsWarehouse} optionPIC={optionSubUsers} />
					</Col>
					{/* <Col span={8}>
						<PrintStatusInfo data={processingListGetById} />
					</Col> */}
				</Row>
				<Row>
					<Col span={24}>
						<Card>
							<Tabs
								onChange={(key) => {
									navigate(`${location.pathname}?tab=${key}`);
								}}
								type="card"
								items={TABS_DETAIL}
							/>
							{params?.tab != "variant" && <OutboundTable generalData={processingListGetById?.processingListGetById?.data}/>}
							{params?.tab == "variant" && <VariantTable />}
						</Card>
					</Col>
				</Row>
				<Flex gap={10} justify="end" style={{marginTop: 10}}>
					<Button
						className="btn-base"
						onClick={() => {
							navigate(
								`/${user?.category_code == 'fulfillment' ? "outbound-manage" : 'warehouse-manage'}/processing-list`
							);
						}}
					>
						Quay lại
					</Button>
					{processingListGetById?.processingListGetById?.data?.status == 'NEW' && <Button
						className="btn-base"
						type="primary"
						onClick={async () => {
							let {data} = await processingListCreatePickStep({
								variables: {
									id: Number(id)
								}
							})
							if (data?.processingListCreatePickStep?.success) {
								showAlert.success('Tạo lộ trình cho danh sách xử lý thành công')
							} else {
								showAlert.error(data?.processingListCreatePickStep?.message || 'Tạo lộ trình cho danh sách xử lý thất bại')
							}
						}}
					>
						Tạo lộ trình
					</Button>}
					{processingListGetById?.processingListGetById?.data?.status == 'PICK_STEP_CREATED' && <Button
						className="btn-base"
						type="primary"
						onClick={() => {
							setShowAssign({
								show: true,
								id: Number(id)
							})
						}}
					>
						Phân công nhân viên
					</Button>}
					{['PICK_STEP_CREATED', 'NEW'].includes(processingListGetById?.processingListGetById?.data?.status) && <Button
						className="btn-base"
						type="primary"
						onClick={() => {
							setShowConfirm({
								show: true,
								id: Number(id)
							})
						}}
					>
						Huỷ
					</Button>}
				</Flex>
			</Spin>
		</ProcessingDetailWrapper>
	);
};

export default ProcessingDetail;
