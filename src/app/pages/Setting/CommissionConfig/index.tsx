import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Table, Col, Popover, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input, Form, Dropdown, Select, Tabs } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { UserSettingWrapper } from "../Setting.styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { HistoryOutlined, FieldTimeOutlined } from "@ant-design/icons";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import CardCommission from "./components/CardCommission";
import query_smeStore from "graphql/queries/query_smeStore";
import query_vrConfigCommission from "graphql/queries/query_vrConfigCommission";
import RetryCommissionModal from "./components/RetryCommissionModal";
import queryString from "querystring";
import query_vrConfigCommissionFulfillment from "graphql/queries/query_vrConfigCommissionFulfillment";
import CardCommissionFulfillment from "./components/CardCommissionFulfillment";
import RetryCommissionFFMModal from "./components/RetryCommissionFFMModal";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
import client from "apollo";

const { Text } = Typography;
const { Search } = Input;

interface LocationState {
    sme_id?: number;
    storeIds?: number[];
    begin_at?: string;
    end_at?: string;
    title?: string;
}

const CommissionConfig = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location?.state as LocationState) || {};
    const [dataStore, setDataStore] = useState<any>([]);
    const [showComfirm, setShowConfirm] = useState<boolean>(false);
    const [showComfirmFFM, setShowConfirmFFM] = useState<boolean>(false);
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const [configs, setConfigs] = useState<any>([]);
    const [configsFFM, setConfigsFFM] = useState<any>([]);

    const { contractId } = useParams();

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: "Quản lý UpS", pathname: "/settings/smes" },
            { title: "Quản lý hợp đồng", pathname: `/settings/smes/contract-management/${state?.sme_id}` },
            { title: "Cấu hình CMS", pathname: `/settings/smes/contract-management/${contractId}/cms?sme_id=${state?.sme_id}` }
        ]);
    }, []);

    const { data: dataConfig, loading: loadingDataConfig } = useQuery(query_vrConfigCommission, {
        variables: {
            sme_id: state?.sme_id,
            contract_id: Number(contractId),
        },
        fetchPolicy: "cache-and-network",
        onCompleted: (data) => {
            if (data?.vrConfigCommission?.success) {
                setConfigs(data?.vrConfigCommission?.settings);
            } else {
                setConfigs([]);
            }
        },
        skip: !state?.sme_id,
    });
    const { data: dataConfigFulfillment, loading: loadingDataConfigFulfillment } = useQuery(query_vrConfigCommissionFulfillment, {
        variables: {
            sme_id: state?.sme_id,
            contract_id: Number(contractId),
        },
        fetchPolicy: "cache-and-network",
        onCompleted: (data) => {
            if (data?.vrConfigCommissionFulfillment?.success) {
                setConfigsFFM(data?.vrConfigCommissionFulfillment?.settings);
            } else {
                setConfigsFFM([]);
            }
        },
        skip: !state?.sme_id,
    });

    const { data: dataSme, loading: loadingDataSme } = useQuery(query_agencyGetSme, {
        fetchPolicy: "cache-and-network",
    });

    const { data, loading: loadingDataStore } = useQuery(query_smeStore, {
        fetchPolicy: "network-only",
        onCompleted: async (data) => {
            const { data: dataScListConnectorStoreAgency } = await client.query({
                query: query_scListConnectorStoreAgency,
                variables: {
                    status: [0, 1]
                },
                fetchPolicy: 'no-cache'
            })
            const optionStore = data?.scAgencySaleStores?.data?.filter(store => {
                return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
            })?.map((item) => {
                const logo = data?.op_connector_channels?.find((channel) => channel?.code === item?.connector_channel_code)?.logo_asset_url;
                return {
                    ...item,
                    value: item?.id,
                    label: item?.name,
                    logo: logo,
                };
            });
            let filterStore = state?.storeIds?.length ? optionStore?.filter(_st => state?.storeIds?.includes(_st?.id)): optionStore
            setDataStore(filterStore?.filter((item) => item?.sme_id === state?.sme_id) || []);
        },
    });

    const currentSME = useMemo(() => {
        if (!dataSme?.agencyGetSme?.length) return {};
        return dataSme?.agencyGetSme?.find((item: any) => item?.sme_id === state?.sme_id);
    }, [dataSme]);

    const onChange = (key: string) => {
        navigate(
            `/settings/smes/contract-management/${contractId}/cms?sme_id=${state?.sme_id}&tab=${key}`,
            {
                replace: false,
                state: {
                    sme_id: state?.sme_id,
                    storeIds: state?.storeIds,
                    begin_at: state?.begin_at,
                    end_at: state?.end_at,
                    title: state?.title,
                }
            }
        );
    };

    return (
        <UserSettingWrapper>
            <Helmet titleTemplate="Cấu hình CMS" defaultTitle="Cấu hình CMS">
                <meta name="description" content="Cấu hình CMS" />
            </Helmet>
            {showComfirm && <RetryCommissionModal sme_id={state?.sme_id} onHide={() => setShowConfirm(false)} begin_at={state?.begin_at} end_at={state?.end_at} />}
            {showComfirmFFM && <RetryCommissionFFMModal sme_id={state?.sme_id} onHide={() => setShowConfirmFFM(false)} begin_at={state?.begin_at} end_at={state?.end_at}/>}
            <Tabs
                defaultActiveKey={params?.tab ? params?.tab : "commission"}
                style={{ marginLeft: 12 }}
                className="transparent-tabs"
                items={[
                    {
                        label: "Cấu hình Commission vận hành",
                        key: "commission",
                    },
                    {
                        label: "Cấu hình Commission Fulfillment",
                        key: "commission-ffm",
                    },
                ]}
                onChange={onChange}
            />
            <Spin spinning={loadingDataSme || loadingDataStore || loadingDataConfig || loadingDataConfigFulfillment}>
                {params?.tab != 'commission-ffm' && !loadingDataConfig && <>
                    {!!dataConfig?.vrConfigCommission?.success && dataConfig?.vrConfigCommission?.settings?.length == 0 ? (
                        <Card>
                            <Flex align="center" justify="center" vertical gap={8}>
                                <Text>Hợp đồng {state?.title} chưa được cấu hình Commmission. Hãy cấu hình ngay</Text>
                                <Button
                                    type="primary"
                                    className="btn-base btn primary"
                                    onClick={() => {
                                        navigate(`/settings/smes/contract-management/${contractId}/cms-create`, { state: { sme_id: state?.sme_id, init: dataConfig?.vrConfigCommission?.init, storeIds: state?.storeIds, begin_at: state?.begin_at, end_at: state?.end_at, title: state?.title, } });
                                    }}
                                >
                                    Cấu hình CMS
                                </Button>
                            </Flex>
                        </Card>
                    ) : (
                        <>
                            <Card style={{ marginBottom: 20 }}>
                                <Row justify="end" align="middle" gutter={10}>
                                    <Col span={4}>
                                        <Text strong>UpS ID: {state?.sme_id}</Text>
                                    </Col>
                                    <Col span={20}>
                                        <Flex justify="end" align="center" gap={10}>
                                            <Tooltip
                                                placement="bottom"
                                                title={`Tài khoản được chỉnh sửa cấu hình commission gần nhất lúc ${dataConfig?.vrConfigCommission?.last_updated_at ? dayjs(dataConfig?.vrConfigCommission?.last_updated_at).format("DD/MM/YYYY HH:mm") : "--"
                                                    }`}
                                            >
                                                <Text>
                                                    <HistoryOutlined style={{ fontSize: 20, color: "#ff5629" }} />
                                                </Text>
                                            </Tooltip>
                                            <Button
                                                type="primary"
                                                className="btn-base btn primary"
                                                onClick={() => {
                                                    navigate(`/settings/smes/contract-management/${contractId}/cms-create?sme_id=${state?.sme_id}`, { state: { sme_id: state?.sme_id, configs: configs, storeIds: state?.storeIds, begin_at: state?.begin_at, end_at: state?.end_at, title: state?.title, } });
                                                }}
                                            >
                                                Chỉnh sửa
                                            </Button>
                                            <Button
                                                className="btn-base btn primary color-base"
                                                onClick={() => {
                                                    setShowConfirm(true);
                                                }}
                                                color="#ff5629"
                                            >
                                                Chạy lại tính toán CMS
                                            </Button>
                                            <Tooltip
                                                placement="bottom"
                                                title={` Tài khoản vừa chạy lại báo cáo  lúc ${dataConfig?.vrConfigCommission?.last_executed_at ? dayjs(dataConfig?.vrConfigCommission?.last_executed_at * 1000).format("DD/MM/YYYY HH:mm") : "--"
                                                    }`}
                                            >
                                                <Text>
                                                    <FieldTimeOutlined style={{ fontSize: 20, color: "#ff5629" }} />
                                                </Text>
                                            </Tooltip>
                                        </Flex>
                                    </Col>
                                </Row>
                            </Card>
                            {!!configs?.length &&
                                configs.map((config, index) => {
                                    return (
                                        <Card style={{ marginBottom: 20 }}>
                                            <CardCommission dataStore={dataStore} config={config} configs={configs} setConfigs={setConfigs} index={index} />
                                        </Card>
                                    );
                                })}
                        </>
                    )}
                </>}
                {params?.tab == 'commission-ffm' && !loadingDataConfigFulfillment && <>
                    {!!dataConfigFulfillment?.vrConfigCommissionFulfillment?.success && dataConfigFulfillment?.vrConfigCommissionFulfillment?.settings?.length == 0 ? (
                        <Card>
                            <Flex align="center" justify="center" vertical gap={8}>
                                <Text>Hợp đồng {state?.title} chưa được cấu hình Commmission Fulfillment. Hãy cấu hình ngay</Text>
                                <Button
                                    type="primary"
                                    className="btn-base btn primary"
                                    onClick={() => {
                                        navigate(`/settings/smes/contract-management/${contractId}/cms-create`, { state: { sme_id: state?.sme_id, isFulfillment: 1, storeIds: state?.storeIds, begin_at: state?.begin_at, end_at: state?.end_at, title: state?.title, } });
                                    }}
                                >
                                    Cấu hình CMS
                                </Button>
                            </Flex>
                        </Card>
                    ) : (
                        <>
                            <Card style={{ marginBottom: 20 }}>
                                <Row justify="end" align="middle" gutter={10}>
                                    <Col span={4}>
                                        <Text strong>UpS ID: {state?.sme_id}</Text>
                                    </Col>
                                    <Col span={20}>
                                        <Flex justify="end" align="center" gap={10}>
                                            <Tooltip
                                                placement="bottom"
                                                title={`Tài khoản được chỉnh sửa cấu hình commission fulfillment gần nhất lúc ${dataConfigFulfillment?.vrConfigCommissionFulfillment?.last_updated_at ? dayjs(dataConfigFulfillment?.vrConfigCommissionFulfillment?.last_updated_at).format("DD/MM/YYYY HH:mm") : "--"
                                                    }`}
                                            >
                                                <Text>
                                                    <HistoryOutlined style={{ fontSize: 20, color: "#ff5629" }} />
                                                </Text>
                                            </Tooltip>
                                            <Button
                                                type="primary"
                                                className="btn-base btn primary"
                                                onClick={() => {
                                                    navigate(`/settings/smes/contract-management/${contractId}/cms-create?sme_id=${state?.sme_id}`, { state: { sme_id: state?.sme_id, configs: configsFFM, isFulfillment: 1, storeIds: state?.storeIds, begin_at: state?.begin_at, end_at: state?.end_at, title: state?.title, } });
                                                }}
                                            >
                                                Chỉnh sửa
                                            </Button>
                                            <Button
                                                className="btn-base btn primary color-base"
                                                onClick={() => {
                                                    setShowConfirmFFM(true);
                                                }}
                                                color="#ff5629"
                                            >
                                                Chạy lại tính toán CMS
                                            </Button>
                                            <Tooltip
                                                placement="bottom"
                                                title={` Tài khoản vừa chạy lại báo cáo  lúc ${dataConfigFulfillment?.vrConfigCommissionFulfillment?.last_executed_at ? dayjs(dataConfigFulfillment?.vrConfigCommissionFulfillment?.last_executed_at * 1000).format("DD/MM/YYYY HH:mm") : "--"
                                                    }`}
                                            >
                                                <Text>
                                                    <FieldTimeOutlined style={{ fontSize: 20, color: "#ff5629" }} />
                                                </Text>
                                            </Tooltip>
                                        </Flex>
                                    </Col>
                                </Row>
                            </Card>
                            {!!configsFFM?.length &&
                                configsFFM.map((config, index) => {
                                    return (
                                        <Card style={{ marginBottom: 20 }}>
                                            <CardCommissionFulfillment dataStore={dataStore} config={config} configs={configsFFM} setConfigs={setConfigsFFM} index={index} />
                                        </Card>
                                    );
                                })}
                        </>
                    )}
                    
                </>}
                <Flex justify="end">
                    <Button
                        style={{ marginRight: 20 }}
                        onClick={() => {
                            navigate(`/settings/smes/contract-management/${state?.sme_id}`)
                        }}
                        className="btn-base color-base"
                    >Đóng</Button>
                </Flex>
            </Spin>
        </UserSettingWrapper>
    );
};

export default CommissionConfig;
