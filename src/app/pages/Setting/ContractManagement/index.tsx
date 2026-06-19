import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, Col, Row, Typography, Spin, Flex, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import query_smeStore from "graphql/queries/query_smeStore";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
import query_vrCmsContracts from "graphql/queries/query_vrCmsContracts";
import { useQuery } from "@apollo/client";
import { SME } from "./types";
import ContractManagementTable from "./components/ContractManagementTable";
import ContractManagementFilter from "./components/ContractManagementFilter";
import { useLocation } from "react-router-dom";
import queryString from "querystring";
import ModalAddContract from "./dialogs/ModalAddContract";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";

const { Text } = Typography;

const ContractManagement = () => {
    const { id } = useParams();
    const { user } = useSelector(selectGlobalSlice);
    const { appendBreadcrumb } = useLayoutContext();
    const [showModalAdd, setShowModalAdd] = useState(false);

    const location = useLocation();

    const params = useMemo(() => {
        return queryString.parse(location.search.slice(1));
    }, [location?.search]);

    const queryVariables = useMemo(() => {

        const dateStart = params?.gt
            ? dayjs.unix(Number(params.gt)).format("YYYY-MM-DD")
            : null;

        const dateEnd = params?.lt
            ? dayjs.unix(Number(params.lt)).format("YYYY-MM-DD")
            : null;

        return {
            search: params?.q || "",
            date_range_start: dateStart,
            date_range_end: dateEnd,
            page: params?.page ? Number(params?.page) : 1,
            per_page: params?.limit ? Number(params?.limit) : 25,
            store_ids: params?.store_ids
                ? String(params?.store_ids).split(",").map(Number)
                : [],
            statuses: params?.statuses
                ? String(params?.statuses).split(",").map(Number)
                : [],
        };
    }, [params]);

    const { data: dataSme, loading: loadingDataSme } = useQuery(
        query_agencyGetSme,
        {
            fetchPolicy: "cache-and-network",
        }
    );

    const { data: dataStores, loading: loadingDataStores } = useQuery(query_smeStore, {
        fetchPolicy: 'cache-and-network'
    });

    const { data: dataScListConnectorStoreAgency, loading: loadingDataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        fetchPolicy: 'cache-and-network',
        variables: {
            sme_id: Number(id),
        },
    });

    const { data: dataVrCmsContracts, loading: loadingVrCmsContracts } =
        useQuery(query_vrCmsContracts, {
            fetchPolicy: "cache-and-network",
            variables: {
                sme_id: Number(id),
                ...queryVariables,
            },
        });

    const optionsStore = useMemo(() => {
        const stores = dataStores?.scAgencySaleStores?.data
            ?.filter(store => {
                const isStoreInList = dataScListConnectorStoreAgency?.scListConnectorStoreAgency
                    ?.map(item => item?.store_id)
                    ?.includes(store?.id);
                
                const isActive = store?.status === 1;

                return isStoreInList && isActive;
            })
            ?.map((store) => {
                const channel = dataStores?.op_connector_channels?.find(
                    (cn) => cn?.code == store?.connector_channel_code
                );

                return {
                    ...store,
                    channel,
                    value: store?.id,
                    label: store?.name,
                };
            });

        return stores || [];
    }, [dataStores, dataScListConnectorStoreAgency]);

    const smeInfo = useMemo(() => {
        const item = dataSme?.agencyGetSme?.find(
            (item: SME) => item?.sme_id === Number(id)
        );
        if (!item) return { name: "--", id: Number(id) };

        return {
            name: item?.full_name || item?.email,
            id: item?.sme_id
        };
    }, [dataSme, id]);

    const smeName = `${smeInfo.name} (${smeInfo.id})`;

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Quản lý tài khoản " :"Cấu hình", pathname: "/settings" },
            { title: "Quản lý UpS", pathname: "/settings/smes" },
            { title: "Quản lý hợp đồng", pathname: `/settings/smes/contract-management/${id}` },
        ]);
    }, []);

    return (
        <>  
            {showModalAdd &&  <ModalAddContract
                    smeId={Number(id)}
                    show={showModalAdd}
                    onHide={() => setShowModalAdd(false)}
                    optionsStore={optionsStore}
                />
            }
            <Helmet
                titleTemplate="Quản lý hợp đồng"
                defaultTitle="Quản lý hợp đồng"
            >
                <meta name="description" content="Quản lý hợp đồng" />
            </Helmet>

            <Spin
                spinning={
                    loadingDataSme ||
                    loadingDataStores ||
                    loadingDataScListConnectorStoreAgency ||
                    loadingVrCmsContracts
                }
            >
                <Card style={{ marginBottom: 20 }}>
                    <Row
                        align={"middle"}
                        gutter={10}
                        style={{ marginBottom: 16 }}
                    >
                        <Col span={12}>
                            <Text strong>Tên tài khoản SME: {smeName}</Text>
                        </Col>
                        <Col span={12}>
                            <Flex justify="end" align="center" gap={10}>
                                <Button
                                    type="primary"
                                    className="btn-base btn primary"
                                    onClick={() => setShowModalAdd(true)}
                                >
                                    <PlusOutlined /> Thêm hợp đồng
                                </Button>
                                {/* <Button className="btn-base btn primary color-base">
                                    Lịch sử
                                </Button> */}
                            </Flex>
                        </Col>
                    </Row>

                    <ContractManagementFilter
                        id={Number(id)}
                        optionsStore={optionsStore}
                    />
                    <ContractManagementTable
                        id={Number(id)}
                        optionsStore={optionsStore || []}
                        dataTable={
                            dataVrCmsContracts?.vrCmsContracts?.data || []
                        }
                        dataPagination={
                            dataVrCmsContracts?.vrCmsContracts?.metadata || []
                        }
                    />
                </Card>
            </Spin>
        </>
    );
};

export default ContractManagement;
