import { useMutation, useQuery } from "@apollo/client";
import { Card, Table, Flex, Spin, Typography, Input, Image, Popover, Tooltip, Row, Col, Button } from "antd";
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
import { CheckCircleFilled, EditOutlined, WarningFilled } from "@ant-design/icons";
import ModalConnectStore from "./dialogs/ModalConnectStore";
import ModalConfigConnectTime from "./dialogs/ModalConfigConnectTime";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
import mutate_scCreateMultipleConnectorStoreAgency from "graphql/mutations/mutate_scCreateMultipleConnectorStoreAgency";
import ModalResult from "./dialogs/ModalResult";
import mutate_scUpdateConnectorStoreAgency from "graphql/mutations/mutate_scUpdateConnectorStoreAgency";
import mutate_scDeleteConnectorStoreAgency from "graphql/mutations/mutate_scDeleteConnectorStoreAgency";

const { Text } = Typography;
const { Search } = Input;

const UpSConnect = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const { user } = useSelector(selectGlobalSlice);
    const [showConfirm, setShowConfirm] = useState({
        show: false,
        storeId: null
    })
    const [showResult, setShowResult] = useState({
        show: false,
        result: []
    })
    const [showConfigTime, setShowConfigTime] = useState<{
        show: boolean;
        stores: any;
        isEditing: boolean;
    }>({
        show: false,
        stores: [],
        isEditing: false
    })
    const [showConnect, setShowConnect] = useState(false)
    const [searchTerm, setSearchTerm] = useState('');

    // const [form] = Form.useForm();

    // const [mutate, { loading }] = useMutation(mutate_agencyCreateTempAccessToken)
    // const [mutateDisconnect, { loading: loadingMutateDisconnect }] = useMutation(mutate_prvPublicRevokeSmeToProvider, {
    //     refetchQueries: ['agencyGetSme', 'prvPublicListSmesByAgency']
    // })

    // const { data: dataConnected, loading: loadingDataConnected } = useQuery(query_prvPublicListSmesByAgency, {
    //     variables: {
    //         page: 1,
    //         per_page: 200
    //     },
    //     fetchPolicy: 'network-only'
    // })

    const { data: dataSme, loading: loadingDataSme } = useQuery(query_agencyGetSme, {
        fetchPolicy: 'network-only'
    })

    const { data: dataScListConnectorStoreAgency, loading: loadingDataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        variables: {
            status: [0, 1]
        },
        fetchPolicy: 'cache-and-network'
    })

    const [scCreateMultipleConnectorStoreAgency, { loading: loadingScCreateMultipleConnectorStoreAgency }] = useMutation(mutate_scCreateMultipleConnectorStoreAgency, {
        awaitRefetchQueries: true,
        refetchQueries: ['scListConnectorStoreAgency', 'agencyGetSme', 'scAgencySaleStores', 'op_connector_channels']
    })

    const [scUpdateConnectorStoreAgency, { loading: loadingScUpdateConnectorStoreAgency }] = useMutation(mutate_scUpdateConnectorStoreAgency, {
        awaitRefetchQueries: true,
        refetchQueries: ['scListConnectorStoreAgency', 'agencyGetSme', 'scAgencySaleStores', 'op_connector_channels']
    })

    const [scDeleteConnectorStoreAgency, { loading: loadingScDeleteConnectorStoreAgency }] = useMutation(mutate_scDeleteConnectorStoreAgency, {
        awaitRefetchQueries: true,
        refetchQueries: ['scListConnectorStoreAgency', 'agencyGetSme', 'scAgencySaleStores', 'op_connector_channels']
    })

    const { data: dataStores, loading: loadingDataStores, refetch } = useQuery(query_smeStore, {
        fetchPolicy: 'network-only'
    })

    const storeList = useMemo(() => {
        const stores = dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(store => {
            const currentStore = dataStores?.scAgencySaleStores?.data?.find(_st => _st?.id == store?.store_id)
            const channel = dataStores?.op_connector_channels?.find(cn => cn?.code == currentStore?.connector_channel_code);
            const sme = dataSme?.agencyGetSme?.find(sme => sme?.sme_id == store?.sme_id)
            return {
                ...store,
                channel,
                value: currentStore?.id,
                label: currentStore?.name,
                ...currentStore,
                sme_full_name: sme?.full_name,
                sme_email: sme?.email,
                status: store?.status,
                id: store?.id
            }
        })
        return stores || []
    }, [dataStores, dataScListConnectorStoreAgency, dataSme]);

    const filteredData = useMemo(() => {
        if (!dataSme) return [];
        return storeList?.filter(store =>
            (store?.sme_full_name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || store?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()))
        );
    }, [dataSme, searchTerm, storeList]);
    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Quản lý tài khoản " :"Cấu hình", pathname: "/settings" },
            {
                title: 'Kết nối UpS',
                pathname: '/settings/connect-ups',
            },
        ]);
    }, []);
    const columns = [
        {
            title: 'Tên gian hàng',
            dataIndex: 'name',
            key: 'name',
            width: '10%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return <Flex gap={4} align="center" style={{ maxWidth: 200 }} justify="start">
                    <img src={record?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
                    <Tooltip title={record?.label}>
                        <Text ellipsis style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record?.label}</Text>
                    </Tooltip>
                </Flex>
            }
        },
        {
            title: 'ID gian hàng',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return (
                    <Text>{record?.store_id}</Text>
                )
            }
        },
        {
            title: 'Tên nhãn hàng',
            dataIndex: 'name',
            key: 'name',
            width: '10%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <><Text>{record?.sme_full_name || record?.sme_email || '--'}</Text>
                    <Text>{` (${record?.sme_id || '--'})`}</Text>
                </>
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                const statusText = record?.status == 1 ? 'Đang hợp tác' : 'Tạm dừng'
                return <Text style={{ color: record?.status == 1 ? '#52c41a' : '#616161' }}>{statusText}</Text>
            }
        },
        {
            title: 'Thời gian kết nối',
            dataIndex: 'connect_at',
            key: 'connect_at',
            width: '15%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <Text>{record?.last_connected_at ? dayjs(record?.last_connected_at).format('DD/MM/YYYY HH:mm') : '--'}</Text>
            }
        },
        {
            title: 'Thời gian hết hạn hợp đồng',
            dataIndex: 'expire_at',
            key: 'expire_at',
            width: '15%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <>
                    <Text>{record?.last_contract_expired_at ? dayjs(record?.last_contract_expired_at).format('DD/MM/YYYY HH:mm') : '--'}</Text>
                    <EditOutlined
                        className="text-primary"
                        style={{ cursor: 'pointer', marginLeft: '4px' }}
                        onClick={() => {
                            setShowConfigTime({
                                show: true,
                                stores: [record],
                                isEditing: true
                            })
                        }} /></>
            }
        },
        {
            title: 'Thời gian tạm dừng',
            dataIndex: 'stop_at',
            key: 'stop_at',
            width: '15%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <Text>{record?.last_disconnected_at ? dayjs(record?.last_disconnected_at).format('DD/MM/YYYY HH:mm') : '--'}</Text>
            }
        },
        {
            title: 'Thao tác',
            dataIndex: 'name',
            key: 'name',
            width: '15%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <>
                    {record?.status == 1 ? <Text
                        style={{ color: '#616161', cursor: 'pointer' }}
                        onClick={async () => {
                            let { data } = await scUpdateConnectorStoreAgency({
                                variables: {
                                    id: record?.id,
                                    status: 0,
                                    last_contract_expired_at: record?.last_contract_expired_at
                                }
                            })
                            if (data?.scUpdateConnectorStoreAgency?.success) {
                                showAlert.success('Tạm dừng gian hàng thành công')
                            } else {
                                showAlert.error(data?.scUpdateConnectorStoreAgency?.message || 'Tạm dừng gian hàng thất bại')
                            }
                        }}
                    >Tạm dừng</Text> :
                        <>
                            <Text style={{ color: '#ff5629', cursor: 'pointer' }}
                                onClick={async () => {
                                    let { data } = await scUpdateConnectorStoreAgency({
                                        variables: {
                                            id: record?.id,
                                            status: 1,
                                            last_contract_expired_at: record?.last_contract_expired_at
                                        }
                                    })
                                    if (data?.scUpdateConnectorStoreAgency?.success) {
                                        showAlert.success('Hợp tác lại gian hàng thành công')
                                    } else {
                                        showAlert.error(data?.scUpdateConnectorStoreAgency?.message || 'Hợp tác lại gian hàng thất bại')
                                    }
                                }}
                            >Hợp tác lại</Text>
                            <Text style={{ margin: '0 12px' }}>|</Text>
                            <Text
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setShowConfirm({
                                        show: true,
                                        storeId: record?.id
                                    })
                                }}
                            >Xoá khỏi Agency</Text>
                        </>
                    }
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
        <ModalConnectStore open={showConnect}
            onHide={() => { setShowConnect(false) }} onConfirm={(stores) => {
                setShowConfigTime({
                    show: true,
                    stores: stores,
                    isEditing: false
                })
                setShowConnect(false)
            }}
        />
        <ModalResult open={showResult?.show} onHide={() => setShowResult({ show: false, result: [] })} result={showResult?.result} />
        {showConfigTime?.show && <ModalConfigConnectTime open={showConfigTime?.show}
            onHide={() => {
                setShowConfigTime({
                    show: false,
                    stores: [],
                    isEditing: false
                })
            }}
            onConfirm={async (stores) => {
                if (!showConfigTime?.isEditing) {
                    let { data } = await scCreateMultipleConnectorStoreAgency({
                        variables: {
                            items: stores?.map(store => {
                                return {
                                    store_id: store?.id,
                                    sme_id: +store?.sme_id,
                                    status: 1,
                                    last_contract_expired_at: store?.last_contract_expired_at ? dayjs(store?.last_contract_expired_at * 1000).startOf('day').format('YYYY-MM-DD HH:mm:ss') : null
                                }
                            })
                        }
                    })
                    if (data?.scCreateMultipleConnectorStoreAgency?.success && data?.scCreateMultipleConnectorStoreAgency?.errors?.length == 0) {
                        showAlert.success('Thêm các gian hàng thành công')
                        refetch()
                    } else {
                        let dataResult = data?.scCreateMultipleConnectorStoreAgency?.errors?.map(err => {
                            let currStore = stores?.find(item => item?.id == err?.store_id)
                            return {
                                ...currStore,
                                ...err
                            }
                        })
                        setShowResult({
                            show: true,
                            result: dataResult
                        })
                    }
                } else {
                    let { data } = await scUpdateConnectorStoreAgency({
                        variables: {
                            id: stores?.[0]?.id,
                            status: stores?.[0]?.status,
                            last_contract_expired_at: typeof stores?.[0]?.last_contract_expired_at === 'number' ? dayjs(stores?.[0]?.last_contract_expired_at * 1000).format('YYYY-MM-DD HH:mm:ss') : stores?.[0]?.last_contract_expired_at
                        }
                    })
                    if (data?.scUpdateConnectorStoreAgency?.success) {
                        showAlert.success('Cập nhật thời gian hết hạn gian hàng thành công')
                    } else {
                        showAlert.error(data?.scUpdateConnectorStoreAgency?.message || 'Cập nhật thời gian hết hạn gian hàng thất bại')

                    }
                }
                setShowConfigTime({
                    show: false,
                    stores: [],
                    isEditing: false
                })
            }}
            stores={showConfigTime?.stores}
            isEditing={showConfigTime?.isEditing}
        />}
        <ModalConfirm
            open={showConfirm?.show}
            onConfirm={async () => {
                let { data } = await scDeleteConnectorStoreAgency({
                    variables: {
                        id: showConfirm?.storeId
                    }
                })
                if (data?.scDeleteConnectorStoreAgency?.success) {
                    showAlert.success("Xoá gian hàng khỏi Agency thành công")
                } else {
                    showAlert.error(data?.scDeleteConnectorStoreAgency.message || "Xoá gian hàng khỏi Agency thất bại")
                }
                setShowConfirm({
                    show: false,
                    storeId: null
                })
            }}
            loading={false}
            onHide={() => setShowConfirm({
                show: false,
                storeId: null
            })}
            title="Sau khi Xóa gian hàng khỏi Agency thì hệ thống sẽ không thống kê số liệu gian hàng này ở báo cáo thống kê nữa. Bạn có muốn xóa gian hàng?"
            confirmTitle='Đồng ý'
            cancelTitle='Hủy' />
        <Spin spinning={loadingDataStores}>
            <Card>
                <Row>
                    <Col span={18}>
                        <Flex className="search-field" align="center">
                            <Text className="search-label">Tên gian hàng</Text>
                            <Search placeholder="Nhập tên nhãn hàng hoặc tên gian hàng" onSearch={onSearch} />
                        </Flex>
                    </Col>
                    <Col span={6} style={{ display: 'flex', justifyContent: 'end' }}>
                        <Button
                            type="primary"
                            className="btn-base btn primary"
                            disabled={loadingScCreateMultipleConnectorStoreAgency}
                            onClick={() => {
                                setShowConnect(true)
                            }}
                        >
                            Thêm gian hàng
                        </Button>
                    </Col>
                </Row>

                <Table
                    className="upbase-table"
                    columns={columns as any}
                    bordered
                    loading={loadingDataSme || loadingDataScListConnectorStoreAgency || loadingDataStores || loadingScUpdateConnectorStoreAgency || loadingScDeleteConnectorStoreAgency || loadingScCreateMultipleConnectorStoreAgency}
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

export default UpSConnect;