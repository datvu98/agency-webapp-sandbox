import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Flex, Card, Col, Input, Row, Typography, Button, Table, Spin, Tag, MenuProps, Dropdown, Avatar } from 'antd';
import { useLayoutContext } from 'app/contexts/LayoutContext';
import { PartnerConnectWrapper } from '../Setting.styles';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import ModalAddAccount, { DataStoreProps } from './dialogs/ModalAddAccount';
import usePartnerConnect from './hooks/usePartnerConnect';
import { PARTNER_ACCOUNT_STATUS, PARTNER_ACCOUNT_STATUS_ACTIVE } from './constant';
import ModalAddAccountRedirect from './dialogs/ModalAddAccountRedirect';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import queryString from 'querystring';
import ConfirmDeletePartnerAccount from './dialogs/ModalConfirmDeleteAccount';
import ModalPausedAccount from './dialogs/ModalPausedPausedAccount';

const { Text } = Typography;
const { Search } = Input;

const PartnerConnect = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { channel } = useParams();
    const params = useMemo(
        () => queryString.parse(location.search.slice(1, location.search.length)),
        [location.search]
    );

    const [showModalAddAccount, setShowModalAddAccount] = useState(false);
    const [showModalAddAccountRedirect, setShowModalAddAccountRedirect] = useState(false);
    const [searchInputValue, setSearchInputValue] = useState('');
    const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [pauseTarget, setPauseTarget] = useState<any | null>(null);
    const {
        dataStore,
        loadingDataStore,
        onAddAccount,
        supportedAddCodes,
        dataPartnerAccounts,
        loadingPartnerAccounts,
        handleDisconnectPartnerAccount,
        loadingDisconnectPartnerAccount,
        handleDeletePartnerAccount,
        loadingDeletePartnerAccount,
        handleReconnectPartnerAccount,
        loadingAuthorize
    } = usePartnerConnect();
    const handleOpenModalAddAccount = () => {
        setShowModalAddAccount(true);
    }

    const handleCloseModalAddAccount = () => {
        setShowModalAddAccount(false);
    }
    const handleCloseModalAddAccountRedirect = useCallback(() => {
        // Khi đóng popup redirect: điều hướng về trang list (xoá :channel + query)
        navigate('/settings/partner-connect', { replace: true });
    }, [navigate]);

    useEffect(() => {
        const hasCode = !!(params as any).code;
        const hasChannel = !!channel;
        setShowModalAddAccountRedirect(hasCode && hasChannel);
    }, [params, channel]);

    const handleConfirmAddAccount = (item: DataStoreProps) => {
        onAddAccount(item);
        setShowModalAddAccount(false);
    }

    const filteredPartnerAccounts = useMemo(() => {
        const keyword = (appliedSearchKeyword || '').trim().toLowerCase();
        if (!keyword) return dataPartnerAccounts;
        return dataPartnerAccounts.filter(
            (row) =>
                (row?.name && String(row.name).toLowerCase().includes(keyword)) ||
                (row?.ref_partner_id && String(row.ref_partner_id).toLowerCase().includes(keyword))
        );
    }, [dataPartnerAccounts, appliedSearchKeyword]);

    const handleSearch = (value: string) => {
        setAppliedSearchKeyword(value || '');
    };

    const handleDeleteAccount = (item: any) => {
        if (item?.id) {
            handleDeletePartnerAccount(item.id);
        }
        setDeleteTarget(null);
    }

    const handleConfirmPauseAccount = (item: any) => {
        if (item?.id) {
            handleDisconnectPartnerAccount(item.id);
        }
        setPauseTarget(null);
    }

    const { appendBreadcrumb } = useLayoutContext();
    useLayoutEffect(() => {
        appendBreadcrumb([
            {
                title: 'Cấu hình',
                pathname: '/settings',
            },
            {
                title: 'Kết nối tài khoản Partner',
                pathname: '/settings/partner-connect',
            }
        ]);
    }, []);

    const columns = [
        {
            title: 'Tên tài khoản',
            dataIndex: 'name',
            key: 'name',
            render: (item, record) => {
                return (
                    item ? (
                        <Flex align="center" gap={8}>
                            <Avatar shape='square' size={24} style={{ flexShrink: 0 }} src={dataStore?.find(item => item?.code == record?.connector_channel_code)?.logo_asset_url} />
                            <Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: record?.name }}>{record?.name}</Text>
                        </Flex >) : '--'
                )
            }
        },
        {
            title: 'ID tài khoản',
            dataIndex: 'ref_partner_id',
            key: 'ref_partner_id',
            render: (item) => {
                return <Text style={{ whiteSpace: 'nowrap' }}>{item || '--'}</Text>
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (item, record) => {
                return <Text style={{ color: record?.status == PARTNER_ACCOUNT_STATUS_ACTIVE ? '#52c41a' : '#616161' }}>
                    {PARTNER_ACCOUNT_STATUS.find(status => status.value == record?.status)?.label ?? '--'}
                </Text>
            }
        },
        {
            title: 'Thời gian kết nối',
            dataIndex: 'last_connected_at',
            key: 'last_connected_at',
            align: 'center',
            render: (item, record) => {
                return <Text>{record?.last_connected_at ? dayjs(record?.last_connected_at).format('DD/MM/YYYY HH:mm') : '--'}</Text>
            }
        },
        {
            title: 'Thời gian hết hạn ủy quyền',
            dataIndex: 'authorization_expired_at',
            key: 'authorization_expired_at',
            align: 'center',
            render: (item, record) => {
                return <Text>{record?.authorization_expired_at ? dayjs(record?.authorization_expired_at).format('DD/MM/YYYY') : '--'}</Text>
            }
        },
        {
            title: 'Thời gian tạm dừng',
            dataIndex: 'last_disconnected_at',
            key: 'last_disconnected_at',
            align: 'center',
            render: (item, record) => {
                return <Text>{record?.last_disconnected_at ? dayjs(record?.last_disconnected_at).format('DD/MM/YYYY HH:mm') : '--'}</Text>
            }
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            align: 'center',
            width: 150,
            render: (item, record) => {
                return <>
                    {record?.status == PARTNER_ACCOUNT_STATUS_ACTIVE ?
                        <Text
                            style={{ color: '#616161', cursor: 'pointer' }}
                            onClick={() => setPauseTarget(record)}
                        >
                            Tạm dừng
                        </Text> :
                        <>
                            <Text style={{ color: '#ff5629', cursor: 'pointer' }}
                                onClick={() => handleReconnectPartnerAccount(record?.connector_channel_code)}
                            >
                                Kết nối lại
                            </Text>
                            <Text style={{ margin: '0 12px' }}>|</Text>
                            <Text
                                style={{ cursor: 'pointer' }}
                                onClick={() => setDeleteTarget(record)}
                            >
                                Xoá khỏi Agency
                            </Text>
                        </>
                    }
                </>
            }
        }
    ];


    return (
        <PartnerConnectWrapper>
            <ModalAddAccount show={showModalAddAccount} onHide={handleCloseModalAddAccount} onConfirm={handleConfirmAddAccount} dataStore={dataStore} supportedAddCodes={supportedAddCodes} loading={loadingDataStore} />
            <ModalAddAccountRedirect show={showModalAddAccountRedirect} onHide={handleCloseModalAddAccountRedirect} />
            <ConfirmDeletePartnerAccount
                open={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => handleDeleteAccount(deleteTarget)}
            />
            <ModalPausedAccount
                open={!!pauseTarget}
                onCancel={() => setPauseTarget(null)}
                onConfirm={() => handleConfirmPauseAccount(pauseTarget)}
            />
            <Helmet
                titleTemplate="Kết nối tài khoản Partner"
                defaultTitle="Kết nối tài khoản Partner"
            >
                <meta name="description" content="Kết nối tài khoản Partner" />
            </Helmet>
            <Spin spinning={loadingPartnerAccounts || loadingDisconnectPartnerAccount || loadingDeletePartnerAccount || loadingAuthorize}>
                <Card>
                    <Row>
                        <Col span={20}>
                            <Flex className="search-field" align="center">
                                <Text className="search-label">Tên tài khoản:</Text>
                                <Search
                                    placeholder="Nhập tên tài khoản hoặc ID tài khoản"
                                    value={searchInputValue}
                                    onChange={(e) => setSearchInputValue(e.target.value)}
                                    onSearch={handleSearch}
                                    allowClear
                                />
                            </Flex>
                        </Col>
                        <Col span={4} className='text-right'>
                            <Button type="primary" className="btn-base" onClick={handleOpenModalAddAccount}>Thêm tài khoản</Button>
                        </Col>
                    </Row>

                    <Table
                        columns={columns as any}
                        dataSource={filteredPartnerAccounts}
                        pagination={{
                            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total}`,
                            pageSize: 10,
                        }}
                        bordered
                        className="upbase-table"
                        sticky={{ offsetHeader: 0 }}
                    />
                </Card>
            </Spin>
        </PartnerConnectWrapper>
    )
}

export default PartnerConnect


export const dataMock = [
    {
        name: 'Tài khoản 1',
        id: '1234567890',
        status: 1,
        connect_at: '2026-01-01 10:00:00',
        expire_at: '2026-01-01',
        stop_at: '2026-01-01 10:00:00',
    },
    {
        name: 'Tài khoản 2',
        id: '1234567890',
        status: 0,
        connect_at: '2026-01-01 10:00:00',
        expire_at: '2026-01-01',
        stop_at: '2026-01-01 10:00:00',
    }
]