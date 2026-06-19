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
// import ModalInfo from "./dialogs/ModalInfo";
import mutate_endHandover from "graphql/mutations/mutate_endHandover";
import query_workSessionWithPagination from "graphql/queries/query_workSessionWithPagination";
import query_agencyGetSubUsers from "graphql/queries/query_agencyGetSubUsers";
import query_getReturnReceiptDetail from "graphql/queries/query_getReturnReceiptDetail";
import mutate_completeReturnReceiptWork from "graphql/mutations/mutate_completeReturnReceiptWork";

const { Text } = Typography;


const ReturnReceiptDetail = () => {
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
                title: "Chi tiết phiếu hoàn trả"
            },
        ]);
    }, []);

    const [printMinutesHandoverList, { loading: loadingPrintMinutesHandoverList }] = useLazyQuery(query_printMinutesHandoverList, {
        fetchPolicy: "cache-and-network",
    });

    const [completeReturnReceiptWork, { loading: loadingCompleteReturnReceiptWork }] = useMutation(mutate_completeReturnReceiptWork, {
        awaitRefetchQueries: true,
        refetchQueries: ['getReturnReceiptDetail']
    });

    const { data: agencyGetSubUsers, loading: loadingAgencyGetSubUsers } = useQuery(query_agencyGetSubUsers, {
        variables: {
            page: 1,
            pageSize: 1000,
        },
        fetchPolicy: "cache-and-network",
    });

    const { data: dataReturnReceiptDetail, loading: loadingDataReturnReceiptDetail } = useQuery(query_getReturnReceiptDetail, {
        variables: {
            id: Number(id),
        },
        fetchPolicy: "cache-and-network",
        skip: !id,
        onCompleted: async (data) => {
            setLoading(true);
            const listWarehouseBillIds = data?.getReturnReceiptDetail?.data?.items?.map((item) => item?.warehouseBillId);
            let listWarehouseBill = await queryWarehouseBillByIds(listWarehouseBillIds);
            const newData = data?.getReturnReceiptDetail?.data?.items?.map((item) => ({
                ...item,
                warehouseBill: listWarehouseBill?.find((bill) => bill?.id == item?.warehouseBillId),
            }));
            setDataTable(newData);
            setLoading(false);
        },
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
        let { data: dataComplete } = await completeReturnReceiptWork({
            variables: {
                handoverListId: Number(id),
                workId: dataWorkSession?.workSessionWithPagination?.data?.[0]?.workId
            },
        });
        if (dataComplete?.completeReturnReceiptWork?.success) {
            showAlert.success("Hoàn thành phiên nhận trả thành công");
        } else {
            showAlert.error(dataComplete?.completeReturnReceiptWork?.message || "Hoàn thành phiên nhận trả thất bại");
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
            {/* {showInfo?.show && (
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
            )} */}
            <Spin spinning={loadingDataReturnReceiptDetail || loading || loadingPrintMinutesHandoverList || loadingCompleteReturnReceiptWork || loadingAgencyGetSubUsers}>
                <Card>
                    <Row gutter={10}>
                        <Col span={18}>
                            <GeneralInfo dataDetail={dataReturnReceiptDetail?.getReturnReceiptDetail?.data} />
                            <DetailTable 
                                dataTable={dataTable} 
                                onPrint={handlePrint} 
                                dataDetail={dataReturnReceiptDetail?.getReturnReceiptDetail?.data}
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

export default ReturnReceiptDetail;
