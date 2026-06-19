import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Tag, Tabs } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { WarehouseBillInDetailWrapper } from "../Warehouse.styles";
import queryString from "querystring";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import query_agencyGetSubUsers from "graphql/queries/query_agencyGetSubUsers";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import query_processingListGetById from "graphql/queries/query_processingListGetById";
import { TABS } from "../ProcessingList/constants";
import query_warehouseBillGetById from "graphql/queries/query_warehouseBillGetById";
import GeneralInfoBill from "./components/GeneralInfoBill";
import query_sme_brands from "graphql/queries/query_sme_brands";
import BillInInfo from "./components/BillInInfo";
import WarehouseBillInItemTable from "./components/WarehouseBillItemTable";
import query_storageEquipmentList from "graphql/queries/query_storageEquipmentList";
import { showAlert } from "utils/helper";
import mutate_warehouseBillComplete from "graphql/mutations/mutate_warehouseBillComplete";
import query_warehouseBillInValidInboundItems from "graphql/queries/query_warehouseBillInValidInboundItems";
import ModalWarning from "../WarehouseBillInList/dialogs/ModalWarning";

const { Text } = Typography;

const WarehouseBillInDetail = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const { user } = useSelector(selectGlobalSlice);
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const { id } = useParams();
    const [showWarning, setShowWarning] = useState({
        show: false,
        dataWarning: [],
        id: 0
    })

    const [warehouseBillInValidInboundItems, {loading: loadingWarehouseBillInValidInboundItems}] = useLazyQuery(query_warehouseBillInValidInboundItems, {
            fetchPolicy: 'cache-and-network'
        })
    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Vận hành nhập" :"Quản lý kho"},
            {
                title: "Chi tiết phiếu nhập kho"
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

    const { data: agencyGetSubUsers, loading: loadingAgencyGetSubUsers } = useQuery(query_agencyGetSubUsers, {
        variables: {
            page: 1,
            pageSize: 1000,
        },
        fetchPolicy: "cache-and-network",
    });

    

    const { data: dataSmes } = useQuery(query_agencyGetSme, {
        fetchPolicy: "cache-and-network",
    });

    const { data: dataBrands } = useQuery(query_sme_brands, {
        fetchPolicy: "cache-and-network",
    });

    const [warehouseBillComplete, {loading: loadingWarehouseBillComplete}] = useMutation(mutate_warehouseBillComplete, {
        awaitRefetchQueries: true,
        refetchQueries: ['warehouseBillListWithPagination', 'warehouseBillGetById']
    })

    const optionsWarehouse = useMemo(() => {
        if (!dataWarehouse) return [];
        return dataWarehouse?.smeWarehouseByAgency?.data?.map((wh) => ({
            label: wh?.name,
            value: wh?.id,
            is_default: wh?.is_default,
        }));
    }, [dataWarehouse]);

    const optionsBrand = useMemo(() => {
        if (!dataBrands) return [];
        const brands = dataBrands?.sme_brands?.map((brand) => ({
            label: `${brand?.sme_id} - ${brand?.name}`,
            value: brand?.id,
        }));
        if (!!params?.ups) {
            return brands?.filter(brand => params?.ups?.split(',')?.includes(brand?.sme_id))
        }
        return brands || []
    }, [dataBrands, params?.ups]);

    const optionSmes = useMemo(() => {
        if (!dataSmes?.agencyGetSme) return [];
        return dataSmes?.agencyGetSme?.map((sme) => ({
            ...sme,
            value: sme?.sme_id,
            label: `${sme?.sme_id} - ${sme?.full_name}`,
        }));
    }, [dataSmes]);

    const { data: warehouseBillGetById, loading: loadingWarehouseBillGetById } = useQuery(query_warehouseBillGetById, {
        variables: {
            id: Number(id),
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

    const handleComplete = async () => {
        let {data} = await warehouseBillComplete({
            variables: {
                id: Number(id)
            }
        })
        if (data?.warehouseBillComplete?.success) {
            showAlert.success('Hoàn thành phiên nhập hàng thành công')
        } else {
            showAlert.error(data?.warehouseBillComplete?.message || 'Hoàn thành phiên nhập hàng thất bại')
        }
    }
    return (
        <WarehouseBillInDetailWrapper>
            <Helmet titleTemplate="Chi tiết phiếu nhập kho" defaultTitle="Chi tiết phiếu nhập kho">
                <meta name="description" content="Chi tiết phiếu nhập kho" />
            </Helmet>
            <Spin spinning={loadingWarehouseBillGetById || loadingWarehouseBillComplete || loadingWarehouseBillInValidInboundItems}>
                {showWarning?.show && <ModalWarning
                    show={showWarning?.show} 
                    onHide={() => {
                        setShowWarning({
                            show: false,
                            dataWarning: [],
                            id: 0
                        })
                    }}
                    onConfirm={() => {
                        handleComplete()
                        setShowWarning({
                            show: false,
                            dataWarning: [],
                            id: 0
                        })
                    }}
                    dataError={showWarning?.dataWarning}
                    />}
                <Row gutter={10} style={{ marginBottom: 10 }}>
                    {/* <Col span={8}>
                        <GeneralInfo data={processingListGetById} />
                    </Col>
                    <Col span={8}>
                        <WarehouseInfo data={processingListGetById} optionsWarehouse={optionsWarehouse} optionSubUsers={optionSubUsers} />
                    </Col>
                    <Col span={8}>
                        <PrintStatusInfo data={processingListGetById} />
                    </Col> */}
                </Row>
                <Row>
                    <Col span={24}>
                        <Card>
                            <Flex gap={10} vertical>
                                <GeneralInfoBill 
                                    dataDetail={warehouseBillGetById?.warehouseBillGetById?.data}
                                    optionsWarehouse={optionsWarehouse}
                                    optionsBrand={optionsBrand}
                                    optionSmes={optionSmes}
                                />
                                <BillInInfo 
                                    dataDetail={warehouseBillGetById?.warehouseBillGetById?.data}
                                    optionSubUsers={optionSubUsers}
                                />
                                <WarehouseBillInItemTable dataDetail={warehouseBillGetById?.warehouseBillGetById?.data}/>
                            </Flex>
                            <Flex justify="end" gap={10} style={{ marginTop: 10 }}>
                                <Button
                                    onClick={() => {
                                        navigate(`/${user?.category_code == 'fulfillment' ? 'inbound-manage' : "warehouse-manage"}/warehouse-bill-in`);
                                    }}
                                    className="btn btn-base"
                                >
                                    Hủy
                                </Button>
                                <Button type="primary" onClick={async() => {
                                    const {data: dataInboundValid} = await warehouseBillInValidInboundItems({
                                        variables: {
                                            id: Number(id)
                                        }
                                    })
                                    if (!!dataInboundValid?.warehouseBillInValidInboundItems?.data?.length) {
                                        setShowWarning({
                                            show: true,
                                            dataWarning: dataInboundValid?.warehouseBillInValidInboundItems?.data,
                                            id: Number(id)
                                        })
                                    } else {
                                        handleComplete()
                                    }
                                }} className="btn btn-base">
                                    Hoàn thành đóng nhận hàng
                                </Button>
                            </Flex>
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </WarehouseBillInDetailWrapper>
    );
};

export default WarehouseBillInDetail;
