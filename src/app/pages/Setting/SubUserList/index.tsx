import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Table, Col, Popover, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input, Form, Dropdown } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { UserSettingWrapper } from '../Setting.styles';
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import query_agencyGetSubUsers from "graphql/queries/query_agencyGetSubUsers";
import dayjs from "dayjs";
import type { MenuProps } from "antd/lib/menu";
import query_smeStoresWarehouse from "graphql/queries/query_smeStoresWarehouse";
import type { SearchProps } from 'antd/es/input/Search';
import ModalConfirm from "app/components/ModalConfirm";
import mutate_agencyDeleteSubUser from "graphql/mutations/mutate_agencyDeleteSubUser";
import query_agencyGetRoles from "graphql/queries/query_agencyGetRoles";
import { showAlert } from "utils/helper";
import { DownOutlined, CheckCircleFilled, WarningFilled } from "@ant-design/icons";
import query_smeStore from "graphql/queries/query_smeStore";
import query_smeChatStore from "graphql/queries/query_smeChatStore";
import query_smeWarehouse from "graphql/queries/query_smeWarehouse";
import queryString from 'querystring'
import Pagination from "app/components/Pagination";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";

const { Text } = Typography;
const { Search } = Input;

const SubUserList = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const location = useLocation()
    const { user } = useSelector(selectGlobalSlice);
    const [open, setOpen] = useState(false)
    const [selectedId, setSelectedId] = useState(null)

    const params = queryString.parse(location.search.slice(1, 100000))
    const [search, setSearch] = useState<any>({
        searchText: '',
        searchType: 0,
    });

    const page = useMemo(() => {
        try {
            let _page = Number(params.page);
            if (!Number.isNaN(_page)) {
                return Math.max(1, _page)
            } else {
                return 1
            }
        } catch (error) {
            return 1;
        }
    }, [params?.page]);

    const pageSize = useMemo(() => {
        try {
            let _value = Number(params?.limit)
            if (!Number.isNaN(_value)) {
                return Math.max(25, _value)
            } else {
                return 25
            }
        } catch (error) {
            return 25
        }
    }, [params?.limit]);

    const { data: dataStore } = useQuery(query_smeStore, {
        fetchPolicy: 'network-only'
    })

    const { data: dataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        variables: {
            status: [0, 1]
        },
        fetchPolicy: 'cache-and-network'
    })

    const { data: dataChatStore } = useQuery(query_smeChatStore, {
        fetchPolicy: 'network-only'
    })

    const { data, loading } = useQuery(query_agencyGetSubUsers, {
        variables: {
            ...search,
            page,
            pageSize
        },
        fetchPolicy: 'network-only'
    })

    const [mutateDelete] = useMutation(mutate_agencyDeleteSubUser, {
        awaitRefetchQueries: true,
        refetchQueries: ['agencyGetSubUsers']
    })

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Quản lý tài khoản " :"Cấu hình", pathname: "/settings" },
            { title: user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"}
        ]);
    }, []);

    const totalRecord = data?.agencyGetSubUsers?.pagination?.total || 0
    const totalPage = Math.ceil(totalRecord / pageSize)
    const columns = [

        {
            title: 'Tên tài khoản phụ',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return <Text>{record?.username || '--'}</Text>
            }
        },
        {
            title: 'Gian hàng phụ trách',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                const storesNum = record?.stores?.includes(-1) ? dataStore?.scAgencySaleStores?.data?.filter(store => {
                    return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
                })?.length : record?.stores?.length
                const chatStoreNum = record?.chatStores?.length

                const contentStores = () => {
                    return <Flex vertical>
                        {record?.stores?.map(store => {
                            if (store == -1) {
                                return dataStore?.scAgencySaleStores?.data?.filter(store => {
                                    return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
                                })?.map(item => {
                                    const logoUrl = dataStore?.op_connector_channels?.find(channel => channel?.code == item?.connector_channel_code)?.logo_asset_url
                                    return <Flex style={{ marginTop: '10px' }}>
                                        <Image height={24} width={24} src={logoUrl}></Image>
                                        <Text style={{ marginLeft: '8px' }}>{item?.name}</Text>
                                    </Flex>
                                })
                            }
                            const currentStore = dataStore?.scAgencySaleStores?.data?.find(item => item?.id == store)
                            const storeName = currentStore?.name
                            const storeLogo = dataStore?.op_connector_channels?.find(channel => channel?.code == currentStore?.connector_channel_code)?.logo_asset_url
                            return <Flex style={{ marginTop: '10px' }} align="center">
                                <Image height={24} width={24} src={storeLogo}></Image>
                                <Text style={{ marginLeft: '8px', marginRight: '8px' }}>{storeName}</Text>
                                {currentStore?.status == 1 ? <Tooltip title={'Đã kết nối'}><CheckCircleFilled style={{ color: '#52c41a' }} /></Tooltip> :
                                    <Tooltip title={'Mất kết nối'}><WarningFilled style={{ color: 'red' }} /></Tooltip>}
                            </Flex>
                        })}
                    </Flex>
                }

                const contentChatStores = () => {
                    return <Flex vertical>
                        {record?.chatStores?.map(store => {
                            if (store == -1) {
                                return dataChatStore?.scAgencyConversationStores?.data?.map(item => {
                                    const logoUrl = dataChatStore?.op_connector_channels?.find(channel => channel?.code == item?.connector_channel_code)?.logo_asset_url
                                    return <Flex style={{ marginTop: '10px' }}>
                                        <Image height={24} width={24} src={logoUrl}></Image>
                                        <Text style={{ marginLeft: '8px' }}>{item?.name}</Text>
                                    </Flex>
                                })
                            }
                            const currentStore = dataChatStore?.scAgencyConversationStores?.data?.find(item => item?.id == store)
                            const storeName = currentStore?.name
                            const storeLogo = dataChatStore?.op_connector_channels?.find(channel => channel?.code == currentStore?.connector_channel_code)?.logo_asset_url
                            return <Flex style={{ marginTop: '10px' }} align="center">
                                <Image height={24} width={24} src={storeLogo}></Image>
                                <Text style={{ marginLeft: '8px', marginRight: '8px' }}>{storeName}</Text>
                                {currentStore?.status == 1 ? <Tooltip title={'Đã kết nối'}><CheckCircleFilled style={{ color: '#52c41a' }} /></Tooltip> :
                                    <Tooltip title={'Mất kết nối'}><WarningFilled style={{ color: 'red' }} /></Tooltip>}
                            </Flex>
                        })}
                    </Flex>
                }
                return (
                    <>
                        <Flex vertical style={{ marginBottom: '12px' }}>
                            <Text>Gian hàng:</Text>
                            <Popover placement='topLeft' content={contentStores} title="Thông tin gian hàng">
                                <Text style={{ color: '#ff5629' }}>{storesNum || 0} gian hàng</Text>
                            </Popover>
                        </Flex>
                        <Flex vertical style={{ marginBottom: '12px' }}>
                            <Text>Gian hàng chat:</Text>
                            <Popover placement='topLeft' content={contentChatStores} title="Thông tin gian hàng chat">
                                <Text style={{ color: '#ff5629' }}>{chatStoreNum || 0} gian hàng chat</Text>
                            </Popover>
                        </Flex>
                    </>
                )
            }
        },
        {
            title: 'Nhóm quyền',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return <Flex vertical>
                    {record?.roleItems?.map(role => {
                        return <Text>{role?.name}</Text>
                    })}
                </Flex>
            }
        },
        {
            title: 'Thời gian',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return <>
                    <Flex vertical style={{ marginBottom: '12px' }}>
                        <Text>Thời gian tạo:</Text>
                        {dayjs.unix(record.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Flex>
                    <Flex vertical>
                        <Text className="mb-1">Thời gian cập nhật:</Text>
                        {dayjs.unix(record.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </Flex>
                </>
            }
        },
        {
            title: 'Thao tác',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                const items: MenuProps['items'] = [
                    {
                        key: '1',
                        label: (
                            <p style={{ marginBottom: '0' }} onClick={() => { navigate(`/settings/sub-user/change-password/${record?.id}`) }}>
                                Đổi mật khẩu
                            </p>
                        ),
                    },
                    {
                        key: '2',
                        label: (
                            <p style={{ marginBottom: '0' }} onClick={() => { navigate(`/settings/sub-user/change-info/${record?.id}`) }}>
                                Cập nhật thông tin
                            </p>
                        ),
                    },
                    {
                        key: '3',
                        label: (
                            <p style={{ marginBottom: '0' }} onClick={() => {
                                const { stores, chatStores, roleItems, warehouses, smes } = record;
                                console.log(roleItems)
                                navigate('/settings/sub-user/create', {
                                    state: { stores, chatStores, roles: roleItems, warehouses, smes }
                                });
                            }}>
                                Sao chép
                            </p>
                        ),
                    },
                    {
                        key: '4',
                        label: (
                            <p style={{ marginBottom: '0' }} onClick={() => {
                                setOpen(true)
                                setSelectedId(record?.id)
                            }}>
                                Xóa
                            </p>
                        ),
                    },
                ];
                return <Flex justify="center"><Dropdown menu={{ items }} placement="bottom" arrow={{ pointAtCenter: true }}>
                    <Button>Chọn
                        <DownOutlined />
                    </Button>
                </Dropdown>
                </Flex>
            }
        }
    ]

    const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
        setSearch(pre => {
            return {
                ...pre,
                searchText: value
            }
        })
    };

    return <UserSettingWrapper>
        <Helmet
            titleTemplate={user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"}
            defaultTitle={user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"}
        >
            <meta name="description" content={user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"} />
        </Helmet>
        <ModalConfirm
            open={open}
            onConfirm={async () => {
                let { data } = await mutateDelete({
                    variables: {
                        id: `${selectedId}`
                    }
                })
                if (data?.agencyDeleteSubUser?.success) {
                    showAlert.success("Xoá tài khoản phụ thành công")
                    setOpen(false)
                    setSelectedId(null)
                } else {
                    showAlert.error(data?.agencyDeleteSubUser.message || "Xoá tài khoản phụ thất bại")
                    setOpen(false)
                    setSelectedId(null)
                }
            }}
            loading={false}
            onHide={() => setOpen(false)}
            title="Tài khoản phụ này sẽ bị xoá khỏi hệ thống và không có quyền truy cập nữa. Bạn có đồng ý xoá ?"
            confirmTitle='Đồng ý'
            cancelTitle='Hủy' />
        <Spin spinning={false}>
            <Card>
                <Row>
                    <Col span={20}>
                        <Flex className="search-field" align="center">
                            <Text className="search-label" style={{flex: 1}}>Tên người dùng:</Text>
                            <Search placeholder="Nhập tên người dùng" onSearch={onSearch} />
                        </Flex>
                    </Col>
                    <Col span={4}>
                        <Button
                            type="primary"
                            className="btn-base"
                            onClick={() => { navigate('/settings/sub-user/create') }}
                        >
                            Thêm tài khoản phụ
                        </Button>
                    </Col>
                </Row>

                <Table
                    className="upbase-table"
                    columns={columns as any}
                    bordered
                    loading={loading}
                    dataSource={data?.agencyGetSubUsers?.items || []}
                    sticky={{ offsetHeader: 0 }}
                    pagination={false}
                />
                {!loading && <Pagination
                    page={page}
                    totalPage={totalPage}
                    loading={loading}
                    limit={pageSize}
                    totalRecord={totalRecord}
                    count={data?.agencyGetSubUsers?.items?.length}
                    basePath={'/settings/sub-user'}
                    emptyTitle={'Không có bản ghi nào'}
                />}
            </Card>
        </Spin>
    </UserSettingWrapper >
};

export default SubUserList;
