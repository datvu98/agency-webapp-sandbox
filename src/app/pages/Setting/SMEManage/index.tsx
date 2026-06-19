import { useMutation, useQuery } from "@apollo/client";
import { Card, Table, Flex, Spin, Typography, Input, Image, Popover, Tooltip } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { UserSettingWrapper } from '../Setting.styles';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { showAlert } from "utils/helper";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import dayjs from "dayjs";
import ModalConfirm from "app/components/ModalConfirm";
import type { SearchProps } from 'antd/es/input/Search';
import query_smeStore from "graphql/queries/query_smeStore";
import query_smeChatStore from "graphql/queries/query_smeChatStore";
import { CheckCircleFilled, WarningFilled } from "@ant-design/icons";
import query_prvPublicListSmesByAgency from "graphql/queries/query_prvPublicListSmesByAgency";
import mutate_agencyCreateTempAccessToken from "graphql/mutations/mutate_agencyCreateTempAccessToken";
import client from "apollo";
import queryString from 'querystring';
import mutate_prvPublicRevokeSmeToProvider from "graphql/mutations/mutate_prvPublicRevokeSmeToProvider";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";

const { Text } = Typography;
const { Search } = Input;

const ManageSMEs = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const { user } = useSelector(selectGlobalSlice);

    const [smeId, setSmeId] = useState(null)
    const [providerConnectedId, setProviderConnectedId] = useState(null)
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('');

    // const [form] = Form.useForm();

    const [mutate, { loading }] = useMutation(mutate_agencyCreateTempAccessToken)
    const [mutateDisconnect, { loading: loadingMutateDisconnect }] = useMutation(mutate_prvPublicRevokeSmeToProvider, {
        refetchQueries: ['agencyGetSme', 'prvPublicListSmesByAgency']
    })

    const { data: dataConnected, loading: loadingDataConnected } = useQuery(query_prvPublicListSmesByAgency, {
        variables: {
            page: 1,
            per_page: 200
        },
        fetchPolicy: 'network-only'
    })

    const { data: dataSme, loading: loadingDataSme } = useQuery(query_agencyGetSme, {
        fetchPolicy: 'network-only'
    })

    const { data: dataStore, loading: loadingDataStore } = useQuery(query_smeStore, {
        fetchPolicy: 'network-only'
    })
    const { data: dataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        variables: {
            status: [0, 1]
        },
        fetchPolicy: 'cache-and-network'
    })

    const { data: dataChatStore, loading: loadingDataChatStore } = useQuery(query_smeChatStore, {
        fetchPolicy: 'network-only'
    })

    const groupedBySmeId = dataConnected?.prvPublicListSmesByAgency?.data.map(item => {
        const smeId = item?.sme_id;
        const selectedSme = dataSme?.agencyGetSme?.find(sme => sme?.sme_id == smeId)
        return {
            ...item, ...selectedSme, provider_connected_id: item?.id
        }
    });

    const filteredData = useMemo(() => {
        if (!dataSme) return [];
        return groupedBySmeId?.filter(user =>
            (user?.full_name?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
            (dataStore?.scAgencySaleStores?.data?.filter(store => {
                return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
            })?.some(store => store?.sme_id === user?.sme_id && store?.name.toLowerCase().includes(searchTerm.toLowerCase()))) ||
            (dataChatStore?.scAgencyConversationStores?.data?.some(store => store?.sme_id === user?.sme_id && store?.name.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }, [dataSme, searchTerm, groupedBySmeId, dataScListConnectorStoreAgency]);

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Quản lý tài khoản " :"Cấu hình", pathname: "/settings" },
            {
                title: 'Quản lý UpS',
                pathname: '/settings/smes',
            },
        ]);
    }, []);
    const columns = [

        {
            title: 'Thông tin tài khoản UpS',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return <><Text>{record?.full_name || record?.email || '--'}</Text>
                    <Text>{` (${record?.sme_id || '--'})`}</Text>
                </>
            }
        },
        {
            title: 'Thông tin gian hàng',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                const storesNum = dataStore?.scAgencySaleStores?.data?.filter(store => {
                    return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
                })?.filter(store => store?.sme_id == record?.sme_id)?.length
                const chatStoreNum = dataChatStore?.scAgencyConversationStores?.data?.filter(store => store?.sme_id == record?.sme_id)?.length

                const contentStores = () => {
                    return <Flex vertical>
                        {dataStore?.scAgencySaleStores?.data?.filter(store => {
                            return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
                        })?.filter(store => store?.sme_id == record?.sme_id)?.map(store => {
                            const storeName = store?.name
                            const storeLogo = dataStore?.op_connector_channels?.find(channel => channel?.code == store?.connector_channel_code)?.logo_asset_url
                            return <Flex style={{ marginTop: '10px' }} align="center">
                                <Image height={24} width={24} src={storeLogo}></Image>
                                <Text style={{ marginLeft: '8px', marginRight: '8px' }}>{storeName}</Text>
                                {store?.status == 1 ? <Tooltip title={'Đã kết nối'}><CheckCircleFilled style={{ color: '#52c41a' }} /></Tooltip> :
                                    <Tooltip title={'Mất kết nối'}><WarningFilled style={{ color: 'red' }} /></Tooltip>}
                            </Flex>
                        })}
                    </Flex>
                }

                const contentChatStores = () => {
                    return <Flex vertical>
                        {dataChatStore?.scAgencyConversationStores?.data?.filter(store => store?.sme_id == record?.sme_id)?.map(store => {
                            const storeName = store?.name
                            const storeLogo = dataChatStore?.op_connector_channels?.find(channel => channel?.code == store?.connector_channel_code)?.logo_asset_url
                            return <Flex style={{ marginTop: '10px' }} align="center">
                                <Image height={24} width={24} src={storeLogo}></Image>
                                <Text style={{ marginLeft: '8px', marginRight: '8px' }}>{storeName}</Text>
                                {store?.status == 1 ? <Tooltip title={'Đã kết nối'}><CheckCircleFilled style={{ color: '#52c41a' }} /></Tooltip> :
                                    <Tooltip title={'Mất kết nối'}><WarningFilled style={{ color: 'red' }} /></Tooltip>}
                            </Flex>
                        })}
                    </Flex>
                }
                return (
                    <>
                        <Flex style={{ marginBottom: '12px' }}>
                            <Text style={{ marginRight: 4 }}>Gian hàng: </Text>
                            <Popover placement='top' content={contentStores} title="Thông tin gian hàng">
                                <Text style={{ color: '#ff5629' }}>{storesNum} gian hàng</Text>
                            </Popover>
                        </Flex>
                        <Flex style={{ marginBottom: '12px' }}>
                            <Text style={{ marginRight: 4 }}>Gian hàng chat: </Text>
                            <Popover placement='top' content={contentChatStores} title="Thông tin gian hàng chat">
                                <Text style={{ color: '#ff5629' }}>{chatStoreNum} gian hàng chat</Text>
                            </Popover>
                        </Flex>
                    </>
                )
            }
        },
        {
            title: 'Thời gian kết nối',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <>
                    <Flex vertical style={{ marginBottom: '12px' }}>
                        {dayjs(new Date(record.last_connected_at).getTime()).format('DD/MM/YYYY HH:mm')}
                    </Flex>
                </>
            }
        },
        {
            title: 'Thao tác',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <>
                    <Text style={{ color: '#ff5629', cursor: 'pointer' }}
                        onClick={async () => {
                            const { data: dataAccessSME } = await mutate({
                                variables: {
                                    smeId: +record?.sme_id
                                }
                            })
                            if (dataAccessSME?.agencyCreateTempAccessToken?.success) {
                                let token = dataAccessSME?.agencyCreateTempAccessToken?.data
                                window.open(`${process.env.REACT_APP_SME_ENDPOINT}/verify-token?${queryString.stringify({
                                    token: token,
                                })}`, "_blank");
                            } else {
                                showAlert.error(dataAccessSME?.agencyCreateTempAccessToken?.message)
                            }
                        }}
                    >Truy cập UpS</Text>
                    <Text style={{ margin: '0 12px' }}>|</Text>
                    <Text
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            navigate(`/settings/smes/contract-management/${record?.sme_id}`);
                        }}>Quản lý hợp đồng</Text>
                    {/* {!user?.is_subuser && <><Text style={{ margin: '0 12px' }}>|</Text>
                        <Text onClick={() => {
                            setOpen(true)
                            setSmeId(record?.sme_id)
                            setProviderConnectedId(record?.provider_connected_id)
                        }} style={{ color: '#616161', cursor: 'pointer' }}>Ngắt kết nối</Text></>} */}
                </>
            }
        }

    ]

    const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
        setSearchTerm(value)
    };

    return <UserSettingWrapper>
        <Helmet
            titleTemplate="Quản lý UpS"
            defaultTitle="Quản lý UpS"
        >
            <meta name="description" content="Quản lý UpS" />
        </Helmet>
        <ModalConfirm
            open={open}
            onConfirm={async () => {
                let { data } = await mutateDisconnect({
                    variables: {
                        provider_connected_id: providerConnectedId,
                        sme_id: smeId
                    }
                })
                if (data?.prvPublicRevokeSmeToProvider?.success) {
                    showAlert.success("Ngắt kết nối UpS thành công")
                    setOpen(false)
                    setSmeId(null)
                    setProviderConnectedId(null)
                } else {
                    showAlert.error(data?.prvPublicRevokeSmeToProvider.message || "Ngắt kết nối UpS thất bại")
                    setOpen(false)
                    setSmeId(null)
                    setProviderConnectedId(null)
                }
            }}
            loading={false}
            onHide={() => setOpen(false)}
            title="Hệ thống sẽ không còn cập nhật và đồng bộ dữ liệu từ UpS này sang nữa. Bạn có đồng ý bỏ liên kết ? "
            confirmTitle='Đồng ý'
            cancelTitle='Hủy' />
        <Spin spinning={false}>
            <Card>
                <Flex className="search-field" align="center">
                    <Text className="search-label">Tên gian hàng</Text>
                    <Search placeholder="Nhập tên nhãn hàng hoặc tên gian hàng" onSearch={onSearch} />
                </Flex>
                <Table
                    className="upbase-table"
                    columns={columns as any}
                    bordered
                    loading={loadingDataSme || loadingDataChatStore || loadingDataStore || loadingDataConnected}
                    dataSource={filteredData || []}
                    tableLayout="auto"
                    sticky={{ offsetHeader: 0 }}
                    pagination={{
                        showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total}`,
                        pageSize: 10,
                    }}
                    scroll={{
                        y: 600,
                    }}
                />
            </Card>
        </Spin>
    </UserSettingWrapper >
};

export default ManageSMEs;