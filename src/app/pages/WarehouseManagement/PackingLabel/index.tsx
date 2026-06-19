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
import query_getLastWorkStationByCurrentUser from "graphql/queries/query_getLastWorkStationByCurrentUser";
import query_processingListItemListWithPagination from "graphql/queries/query_processingListItemListWithPagination";
import query_sme_brands from "graphql/queries/query_sme_brands";
import { queryWarehouseBillList } from "./helpers";
import ModalCreatePackStation from "./dialogs/ModalCreatePackStation";
import GeneralInfo from "./components/GeneralInfo";
import PackingScanSection from "./components/PackingScanSection";
import NewlyProcessedPackList from "./components/NewlyProcessedPackList";


const { Text } = Typography;


const LabelPackStation = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const { user } = useSelector(selectGlobalSlice);
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [dataTable, setDataTable] = useState([])

	useLayoutEffect(() => {
		appendBreadcrumb([
			{ title: user?.category_code == 'fulfillment' ? "Vận hành xuất" :"Quản lý kho"},
			{
				title: "Đóng gói vận đơn",
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

	const {data: dataWorkStation, loading: loadingWorkStation} = useQuery(query_getLastWorkStationByCurrentUser, {
		fetchPolicy: 'cache-and-network'
	})

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

	const {data: dataProcessingList, loading: loadingProcessingList, error} = useQuery(query_processingListItemListWithPagination, {
		variables: {
			limit,
			offset: (page-1)*limit,
			orderBy: {
				packedAt: 'desc'
			},
			where: {
				status: {
					_eq: 'PACKED'
				},
				warehouseBill: {
					tempLabelUrl: {
						_is_null: false
					}
				}
			}
		},
		fetchPolicy: 'cache-and-network',
		onCompleted: async (data) => {
			let warehouseBills = await queryWarehouseBillList(data?.processingListItemListWithPagination?.data?.map(item => item?.warehouseBillId))
			let newData = data?.processingListItemListWithPagination?.data?.map(item => {
				const warehouseBill = warehouseBills?.find(bill => bill?.id == item?.warehouseBillId)
				return {
					...item, 
					warehouseBill
				}
			})
			setDataTable(newData)
		}
	})

	const currentWorkStation = useMemo(() => {
		if (!dataWorkStation?.getLastWorkStationByCurrentUser?.data) {
			return null
		}
		return dataWorkStation?.getLastWorkStationByCurrentUser?.data
	}, [dataWorkStation])

	const optionBrands = useMemo(() => {
			if (!dataBrand?.sme_brands?.length) return [];
			return dataBrand?.sme_brands?.map((brand) => ({
				label: `${brand?.sme_id} - ${brand?.name}`,
				value: brand?.id,
			}));
			
		}, [dataBrand]);
	return (
        <>
			<Helmet titleTemplate="Đóng gói vận đơn" defaultTitle="Đóng gói vận đơn">
				<meta name="description" content="Đóng gói vận đơn" />
			</Helmet>
            {!currentWorkStation && !loadingWorkStation && <ModalCreatePackStation
                show={!currentWorkStation}
            />}
			<Spin spinning={loadingWorkStation}>
				{!!currentWorkStation && <Card className="card-switch" title={false}>
                    <GeneralInfo currentWorkStation={currentWorkStation}/>
                    <PackingScanSection currentWorkStation={currentWorkStation}/>
					<NewlyProcessedPackList
						data={dataTable} 
						dataPagination={dataProcessingList?.processingListItemListWithPagination?.meta} 
						loading={loadingProcessingList} 
						error={error}
						optionBrands={optionBrands}
					/>
				</Card>}
			</Spin>
        </>
	);
};

export default LabelPackStation;
