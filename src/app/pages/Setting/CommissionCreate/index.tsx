import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Flex, Row, Spin, Typography } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { UserSettingWrapper } from '../Setting.styles';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { showAlert } from "utils/helper";
import { CloseOutlined } from "@ant-design/icons";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import query_smeStore from "graphql/queries/query_smeStore";
import CardCommission from "./CardCommission";
import mutate_vrUpsertConfigCommission from "graphql/mutations/mutate_vrUpsertConfigCommission";
import { checkDuplicateStores, checkDuplicateStoresFFM, removeTypename, validateFormula } from "./utils";
import CardCommissionFulfillment from "./CardCommissionFulfillment";
import mutate_vrUpsertConfigCommissionFulfillment from "graphql/mutations/mutate_vrUpsertConfigCommissionFulfillment";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
import client from "apollo";

const { Text } = Typography;
interface LocationState {
    sme_id?: number;
    configs?: any;
    init?: any,
    isFulfillment?: any,
    storeIds?: number[],
    begin_at?: string;
    end_at?: string;
    title?: string;
}

const CommissionCreate = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const location = useLocation()
    const state = location?.state as LocationState || {}
    const [dataStore, setDataStore] = useState<any>([])
    const [configs, setConfigs] = useState<any>([])
    
    const { contractId } = useParams();

    useEffect(() => {
        if (!state?.sme_id && !state?.init) {
            setConfigs([])
        } else {
            if (!state?.isFulfillment) {
                setConfigs([
                    {
                        extended_groups: [],
                        groups: [
                            {
                                formula_result: '',
                                formula_rules: [
                                    {
                                        applied_indicator: 'nmv',
                                        comparison_operators: '>',
                                        operands: 0,
                                        stores: []
                                    }
                                ],
                                stores: []
                            }
                        ]
                    }
                ])
            } else {
                setConfigs([{
                    commission_per_order: 1,
                    formula_result: '',
                    stores: []
                }])
            }
        }
        if (!!state?.configs) {
            setConfigs(state?.configs)
        }
    }, [state])


    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: "Quản lý UpS", pathname: "/settings/smes" },
            { title: "Quản lý hợp đồng", pathname: `/settings/smes/contract-management/${state?.sme_id}` },
            { title: "Cấu hình CMS", pathname: `/settings/smes/contract-management/${contractId}/cms?sme_id=${state?.sme_id}` }
        ]);
    }, []);

    const { data: dataSme, loading: loadingDataSme } = useQuery(query_agencyGetSme, {
        fetchPolicy: 'cache-and-network',
    })

    const { data, loading: loadingDataStore } = useQuery(query_smeStore, {
        fetchPolicy: 'network-only',
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
            })?.map(item => {
                const logo = data?.op_connector_channels?.find(channel => channel?.code === item?.connector_channel_code)?.logo_asset_url
                return {
                    ...item,
                    value: item?.id,
                    label: item?.name,
                    logo: logo
                }
            })
            let filterStore = state?.storeIds?.length ? optionStore?.filter(_st => state?.storeIds?.includes(_st?.id)): optionStore
            setDataStore(filterStore?.filter((item) => item?.sme_id === state?.sme_id) || []);
        }
    })

    const [vrUpsertConfigCommission, { loading: loadingVrUpsertConfigCommission }] = useMutation(mutate_vrUpsertConfigCommission, {
        awaitRefetchQueries: true,
        refetchQueries: []
    })

    const [vrUpsertConfigCommissionFulfillment, { loading: loadingVrUpsertConfigCommissionFulfillmet }] = useMutation(mutate_vrUpsertConfigCommissionFulfillment, {
        awaitRefetchQueries: true,
        refetchQueries: []
    })

    const validateAllFormulas = () => {
        for (let group of configs) {
            for (let subgroup of group.groups) {
                if (!validateFormula(subgroup.formula_result)) {
                    return false;
                }
            }
            for (let extendedGroup of group.extended_groups) {
                if (!validateFormula(extendedGroup.formula_result)) {
                    return false;
                }
            }
        }
        return true;
    };
    const validateAllFormulasFFM = () => {
        for (let config of configs) {
            if (!validateFormula(config.formula_result)) {
                return false;
            }
        }
        return true;
    };

    const validateAllStores = () => {
        for (let group of configs) {
            for (let subgroup of group.groups) {
                if (subgroup?.stores?.length === 0) {
                    return false
                }
                for (let rule of subgroup.formula_rules) {
                    if (rule.stores.length === 0) {
                        return false;
                    }
                }
            }
            for (let extendedGroup of group.extended_groups) {
                if (extendedGroup?.stores?.length === 0) {
                    return false
                }
                for (let rule of extendedGroup.formula_rules) {
                    if (rule.stores.length === 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    };
    const validateAllStoresFFM = () => {
        for (let config of configs) {
            if (config?.stores?.length === 0) {
                return false
            }
        }
        return true;
    };

    const handleUpdate = async () => {
        if (!validateAllFormulas()) {
            showAlert.error('Có ít nhất một công thức không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }

        if (!validateAllStores()) {
            showAlert.error('Vui lòng chọn gian hàng');
            return;
        }

        if (checkDuplicateStores(configs)) {
            showAlert.error('Có ít nhất một gian hàng bị trùng lặp. Vui lòng kiểm tra lại.');
            return;
        }

        const cleanedConfigs = JSON.parse(JSON.stringify(configs));
        removeTypename(cleanedConfigs);

        let { data } = await vrUpsertConfigCommission({
            variables: {
                sme_id: state?.sme_id,
                contract_id: Number(contractId),
                settings: cleanedConfigs
            }
        })
        if (data?.vrUpsertConfigCommission?.success) {
            showAlert.success('Cập nhật cấu hình CMS thành công')
            navigate(`/settings/smes/contract-management/${contractId}/cms?sme_id=${state?.sme_id}`, {
                state: {
                    sme_id: state?.sme_id,
                    begin_at: state?.begin_at,
                    end_at: state?.end_at,
                    title: state?.title,
                }
            })
        } else {
            showAlert.error(data?.vrUpsertConfigCommission?.message || 'Cập nhật cấu hình CMS không thành công')

        }
    }

    const handleUpdateFulillment = async () => {
        if (!validateAllFormulasFFM()) {
            showAlert.error('Có ít nhất một công thức không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }

        if (!validateAllStoresFFM()) {
            showAlert.error('Vui lòng chọn gian hàng');
            return;
        }

        if (checkDuplicateStoresFFM(configs)) {
            showAlert.error('Có ít nhất một gian hàng bị trùng lặp. Vui lòng kiểm tra lại.');
            return;
        }

        const cleanedConfigs = JSON.parse(JSON.stringify(configs));
        removeTypename(cleanedConfigs);

        let { data } = await vrUpsertConfigCommissionFulfillment({
            variables: {
                sme_id: state?.sme_id,
                contract_id: Number(contractId),
                settings: cleanedConfigs
            }
        })
        if (data?.vrUpsertConfigCommissionFulfillment?.success) {
            showAlert.success('Cập nhật cấu hình CMS thành công')
            navigate(`/settings/smes/contract-management/${contractId}/cms?sme_id=${state?.sme_id}?tab=commission-ffm`, {
                state: {
                    sme_id: state?.sme_id,
                    begin_at: state?.begin_at,
                    end_at: state?.end_at,
                    title: state?.title,
                }
            })
        } else {
            showAlert.error(data?.vrUpsertConfigCommissionFulfillment?.message || 'Cập nhật cấu hình CMS không thành công')

        }
    }

    const handleDeleteConfig = (index: number) => {
        const newConfigs = [...configs];
        newConfigs.splice(index, 1);
        setConfigs(newConfigs);
    };

    return <UserSettingWrapper>
        <Helmet
            titleTemplate="Cấu hình CMS"
            defaultTitle="Cấu hình CMS"
        >
            <meta name="description" content="Cấu hình CMS" />
        </Helmet>
        <Spin spinning={loadingDataSme || loadingDataStore || loadingVrUpsertConfigCommission || loadingVrUpsertConfigCommissionFulfillmet}>

            {
                !!configs?.length && configs.map((config, index) => {
                    return <Card style={{ marginBottom: 20 }}>
                        {configs?.length > 1 && <Flex justify="end">
                            <Text style={{ cursor: 'pointer' }} onClick={() => handleDeleteConfig(index)}>
                                <CloseOutlined />
                            </Text>
                        </Flex>}
                        {!state?.isFulfillment && <CardCommission dataStore={dataStore} config={config} configs={configs} setConfigs={setConfigs} index={index} />}
                        {!!state?.isFulfillment && <CardCommissionFulfillment dataStore={dataStore} config={config} configs={configs} setConfigs={setConfigs} index={index} />}
                        {!state?.isFulfillment && <Row style={{ marginTop: 20 }}>
                            {config?.extended_groups?.length < 3 && <Button
                                style={{ marginRight: 20 }}
                                className="btn-base btn primary color-base"
                                onClick={() => {
                                    const newCondition = {
                                        formula_result: '',
                                        formula_rules: [
                                            {
                                                applied_indicator: 'nmv',
                                                comparison_operators: '>',
                                                operands: 0,
                                                stores: []
                                            },
                                        ],
                                        stores: config?.groups[0]?.stores
                                    };

                                    const newConfigs = [...configs];
                                    newConfigs[index].extended_groups = [...newConfigs[index].extended_groups, newCondition];
                                    setConfigs(newConfigs);
                                }}
                                color="#ff5629"
                            >Thêm điều kiện phụ</Button>}
                            {index == 0 && <Button
                                type="primary"
                                className="btn-base btn primary"
                                onClick={() => {
                                    const newConfigs = [...configs];
                                    newConfigs.push({
                                        extended_groups: [],
                                        groups: [
                                            {
                                                formula_result: '',
                                                formula_rules: [
                                                    {
                                                        applied_indicator: 'nmv',
                                                        comparison_operators: '>',
                                                        operands: 0,
                                                        stores: []
                                                    }
                                                ],
                                                stores: []
                                            }
                                        ]
                                    });
                                    setConfigs(newConfigs);
                                }}
                            >Thêm cấu hình cho gian hàng khác</Button>}
                        </Row>}
                        {!!state?.isFulfillment && <Row style={{ marginTop: 20 }}>
                            {config?.commission_per_order == null && <Button
                                style={{ marginRight: 20 }}
                                className="btn-base btn primary color-base"
                                onClick={() => {
                                    const newConfigs = [...configs];
                                    newConfigs[index].commission_per_order = 1;
                                    setConfigs(newConfigs);
                                }}
                                color="#ff5629"
                            >Thêm điều kiện ràng buộc</Button>}
                            {index == 0 && <Button
                                type="primary"
                                className="btn-base btn primary"
                                onClick={() => {
                                    const newConfigs = [...configs];
                                    newConfigs.push({
                                        commission_per_order: null,
                                        formula_result: '',
                                        stores: []
                                    });
                                    setConfigs(newConfigs);
                                }}
                            >Thêm cấu hình cho gian hàng khác</Button>}
                        </Row>}
                    </Card>
                })
            }
            <Flex justify="end">
                <Button
                    style={{ marginRight: 20 }}
                    onClick={() => {
                        navigate(`/settings/smes/contract-management/${contractId}/cms?sme_id=${state?.sme_id}`, {
                            state: {
                                sme_id: state?.sme_id,
                                storeIds: state?.storeIds,
                                begin_at: state?.begin_at,
                                end_at: state?.end_at,
                                title: state?.title,
                            }
                        })
                    }}
                    className="btn-base btn primary"
                >Đóng</Button>
                {!state?.isFulfillment && <Button
                    type="primary"
                    className="btn-base btn primary"
                    disabled={!configs?.length}
                    onClick={handleUpdate}
                >Cập nhật</Button>}
                {!!state?.isFulfillment && <Button
                    type="primary"
                    className="btn-base btn primary"
                    disabled={!configs?.length}
                    onClick={handleUpdateFulillment}
                >Cập nhật</Button>}
            </Flex>
        </Spin>
    </UserSettingWrapper >
};

export default CommissionCreate;
