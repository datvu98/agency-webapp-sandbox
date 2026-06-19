import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import queryString from "querystring";
import ScanActionSection from "./components/ScanActionSection";
import { PackingDetailWrapper } from "../Warehouse.styles";
import query_workSessionGetById from "graphql/queries/query_workSessionGetById";
import { queryProcessingListById, querySmeVariantByIds, queryStorageEquipmentById, queryWarehouseBillByIds } from "./helpers";
import query_workSessionItemWithPagination from "graphql/queries/query_workSessionItemWithPagination";
import query_quantityProgressPacking from "graphql/queries/query_quantityProgressPacking";
import PackingList from "./components/PackingList";
import PackingItemDetail from "./components/PackingItemDetail";
import ShippingInfo from "./components/ShippingInfo";

const { Text } = Typography;

const PackingDetail = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const { user } = useSelector(selectGlobalSlice);
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const [selectedRow, setSelectedRow] = useState<{id?: string}>({});
    const {id} = useParams()
    const [dataDetail, setDataDetail] = useState({})
    const [dataItem, setDataItem] = useState([])
    const [loading, setLoading] = useState(false)


    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Vận hành xuất" :"Quản lý kho"},
            {
                title: "Chi tiết đóng gói"
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
		if (!params?.q) return {};
		return {
			_or: [
				{
					variant: {
						sku: {
							_eq: params?.q,
						},
					},
				},
				{
					variant: {
						gtin: {
							_eq: params?.q,
						},
					},
				},
				{
					warehouseBill: {
						orderCode: {
							_eq: params?.q,
						},
					},
				},
				{
					warehouseBill: {
						code: {
							_eq: params?.q,
						},
					},
				},
                {
					warehouseBill: {
						systemPackageNumber: {
							_eq: params?.q,
						},
					},
				},
			],
		};
	}, [params?.q]);

    const {data: dataWorkSession, loading: loadingWorkSession} = useQuery(query_workSessionGetById, {
        variables: {
            id: Number(id)
        },
        fetchPolicy: 'network-only',
        onCompleted: async (data) => {
            setLoading(true)
            let processingListId = data?.workSessionGetById?.data?.work?.targetId
            let storageEquipmentId = data?.workSessionGetById?.data?.devices?.[0]?.storageEquipmentId
            const processingListDetail = await queryProcessingListById(processingListId)
            const storageEquipmentDetail = await queryStorageEquipmentById(storageEquipmentId)
            const newData = {
                ...data?.workSessionGetById?.data,
                processingList: processingListDetail,
                storageEquipment: storageEquipmentDetail
            }
            setDataDetail(newData)
            setLoading(false)
        }
    })

    const {data: dataWorkSessionItem, loading: loadingWorkSessionItem} = useQuery(query_workSessionItemWithPagination, {
        variables: {
            // limit,
            // offset: (page-1)*limit,
            where: {
                workSessionId: {
                    _eq: Number(id)
                },
                ...searchText
            }
        },
        fetchPolicy: 'cache-and-network',
        onCompleted: async (data) => {
            setLoading(true)
            let variantIds = data?.workSessionItemWithPagination?.data?.map(item => item?.variantId)
            let warehouseBillIds = data?.workSessionItemWithPagination?.data?.map(item => item?.warehouseBillId)
            const variantsList = await querySmeVariantByIds(variantIds)
            const warehouseBillList = await queryWarehouseBillByIds(warehouseBillIds)
            const newData = data?.workSessionItemWithPagination?.data?.map(item => ({
                ...item, 
                variant: variantsList?.find(_variant => _variant?.id == item?.variantId),
                warehouseBill: warehouseBillList?.find(bill => bill?.id == item?.warehouseBillId)
            }))
            setDataItem(newData)
            setLoading(false)
        }
    })

    const {data: dataCount, loading: loadingDataCount} = useQuery(query_quantityProgressPacking, {
        variables: {
            workSessionId: Number(id),
        },
        fetchPolicy: 'cache-and-network',
    })
    return (
        <PackingDetailWrapper>
            <Helmet titleTemplate="Đóng gói hàng hoá" defaultTitle="Đóng gói hàng hoá">
                <meta name="description" content="Đóng gói hàng hoá" />
            </Helmet>
            
            <Spin spinning={loadingWorkSession || loadingWorkSessionItem || loading}>
                    <Row gutter={10}>
                        <Col span={24}>
                            <ScanActionSection dataDetail={dataDetail} setSelectedRow={setSelectedRow} dataPagination={dataWorkSessionItem?.workSessionItemWithPagination?.meta}
                                dataCount={dataCount?.quantityProgressPacking?.data}
                            />
                        </Col>
                        <Col span={6}>
                            <PackingList 
                                dataCount={dataCount?.quantityProgressPacking?.data}
                                selectedRow={selectedRow} 
                                setSelectedRow={setSelectedRow} 
                                dataItem={dataItem}
                                dataPagination={dataWorkSessionItem?.workSessionItemWithPagination?.meta}
                                dataDetail={dataDetail}
                            />
                        </Col>
                        <Col span={12}>
                            <PackingItemDetail
                                selectedRow={selectedRow} 
                                dataItem={dataItem}
                                dataDetail={dataDetail}
                                dataCount={dataCount?.quantityProgressPacking?.data}
                            />
                        </Col>
                        <Col span={6}>
                            <ShippingInfo selectedRow={selectedRow} 
                                dataItem={dataItem}
                                dataDetail={dataDetail}
                                dataCount={dataCount?.quantityProgressPacking?.data}/>
                        </Col>
                    </Row>
            </Spin>
        </PackingDetailWrapper>
    );
};

export default PackingDetail;
