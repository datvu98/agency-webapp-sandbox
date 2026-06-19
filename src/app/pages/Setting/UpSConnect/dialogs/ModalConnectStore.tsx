import { InfoCircleOutlined, SearchOutlined, WarningFilled } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { Button, Checkbox, Col, Flex, Input, Modal, Radio, Row, Spin, Table, Tooltip, Typography, Pagination } from "antd";
import query_op_smes from "graphql/queries/query_op_smes";
import query_ScStoreForAgency from "graphql/queries/query_ScStoreForAgency";
import query_smeStore from "graphql/queries/query_smeStore";
import React, { memo, useCallback, useMemo, useState } from "react";

interface ModalConnectStoreProps {
    open: boolean,
    onConfirm: (stores: any) => void,
    onHide: () => void,
}

const { Text } = Typography

const MAX_STORE_ADD = 10

const ModalConnectStore = ({
    open,
    onConfirm,
    onHide,
}: ModalConnectStoreProps) => {
    const [selectedStores, setSelectedStores] = useState<any>([]);
    const [search, setSearch] = useState<any>({
        searchText: '',
        searchType: '',
        page: 1,
        limit: 5,
    });

    const { data: dataAllStore, loading: loadingDataAllStore } = useQuery(query_ScStoreForAgency, {
        variables: {
            page: search?.page,
            per_page: search?.limit,
            search: search?.searchText,
            status: [1, 2]
        },
        fetchPolicy: 'cache-and-network'
    })

    const { data: dataSme, loading: loadingDataSme } = useQuery(query_op_smes, {
        fetchPolicy: 'no-cache'
    })

    const storeOption = useMemo(() => {
        if (!loadingDataAllStore && !dataAllStore?.ScStoreForAgency?.stores?.length) return []
        return dataAllStore?.ScStoreForAgency?.stores?.map(store => {
            const channel = dataAllStore?.op_connector_channels?.find(cn => cn?.code == store?.connector_channel_code);
            const sme = dataSme?.op_smes?.find(sme => sme?.id == store?.sme_id)
            return {
                ...store,
                channel,
                value: store?.id,
                label: store?.name,
                sme_full_name: sme?.name,
                sme_email: sme?.email,
            }
        })
    }, [dataAllStore, dataSme, loadingDataAllStore])

    const columns = [
        {
            title: 'Store ID',
            dataIndex: 'id',
            key: 'id',
            width: '15%',
            align: 'left',
            render: (item, record) => {
                return (
                    <Text>{record?.id}</Text>
                )
            }
        },
        {
            title: 'Tên gian hàng',
            dataIndex: 'name',
            key: 'name',
            width: '35%',
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
            title: 'UpS ID',
            dataIndex: 'ups',
            key: 'ups',
            width: '15%',
            align: 'center',
            render: (item, record) => {
                return <Text>{record?.sme_id || '--'}</Text>
            }
        },
        {
            title: 'Tên công ty',
            dataIndex: 'name',
            key: 'name',
            width: '35%',
            align: 'center',
            render: (item, record) => {
                return <><Text>{record?.sme_full_name || record?.sme_email || '--'}</Text>
                </>
            }
        },
    ]
    const rowSelection = useMemo(() => {
        return {
            selectedRowKeys: selectedStores?.map(store => store?.id),
            onSelect: (record, selected) => {
                if (!selectedStores?.map(item => item?.id)?.includes(record?.id)) {
                    setSelectedStores(prev => [...prev, record])
                } else {
                    setSelectedStores(prev => prev?.filter(st => st?.id != record?.id))
                }
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                const changedRowIds = changeRows?.map(row => row?.id) || [];
                const prevSelectedIds = selectedStores?.map(store => store?.id) || [];
                if (changedRowIds?.every(id => prevSelectedIds?.includes(id))) {
                    const updated = selectedStores.filter(store => !storeOption?.map(item => item?.id).includes(store?.id));
                    setSelectedStores(updated);
                } else {
                    const updated = [...selectedStores, ...changeRows];
                    setSelectedStores(updated.slice(0, MAX_STORE_ADD));
                }
            },
            getCheckboxProps: (record) => ({
                disabled: selectedStores.length >= 10 && !selectedStores.find(store => store.id === record.id),
            }),
        }
    }, [selectedStores]);
    const onResetData = useCallback(() => {
        setSearch({
            searchText: '',
            searchType: '',
            page: 1,
            limit: 5,
        })
        setSelectedStores([]);
        onHide();
    }, []);

    return (
        <Modal
            title={'Thêm kết nối gian hàng'}
            open={open}
            width={1200}
            closable={false}
            style={{ textAlign: 'left' }}
            footer={[
                <Flex className="w-100" align="center" gap={20} justify="end">
                    <Button
                        type="primary"
                        className="btn-base btn-cancel"
                        onClick={onResetData}
                    >
                        Huỷ
                    </Button>
                    <Button
                        type="primary"
                        className="btn-base"
                        disabled={selectedStores?.length == 0}
                        onClick={() => {
                            onConfirm(selectedStores)
                            setSelectedStores([])
                            setSearch({
                                searchText: '',
                                searchType: '',
                                page: 1,
                                limit: 5,
                            })
                        }}
                    >
                        Tiếp tục
                    </Button>
                </Flex>
            ]}
        >
            <Spin spinning={loadingDataSme || loadingDataAllStore}>
                <Flex vertical gap={20}>
                    <Row>
                        <Col span={12}>
                            <Input
                                className="input-wrapper"
                                placeholder="Tìm kiếm tên gian hàng"
                                prefix={<SearchOutlined />}
                                value={search?.searchText}
                                onChange={(e) => {
                                    setSearch({ ...search, searchText: e.target.value, page: 1 })
                                }}
                                onKeyDown={(e: any) => {
                                    if (e.keyCode == 13) {
                                        setSearch({ ...search, searchText: e.target.value, page: 1 })
                                    }
                                }}
                            />
                        </Col>
                    </Row>
                    <Flex align="center" gap={8}>
                        <Text>Đã chọn: {selectedStores?.length} / {MAX_STORE_ADD}</Text>
                        <Tooltip title="Số lượng gian hàng đã chọn" placement="bottom">
                            <InfoCircleOutlined />
                        </Tooltip>
                    </Flex>
                    <Table
                        rowKey={'id'}
                        className="upbase-table"
                        columns={columns as any}
                        bordered
                        loading={loadingDataAllStore}
                        dataSource={storeOption || []}
                        rowSelection={{
                            type: 'checkbox',
                            ...rowSelection,
                        }}
                        tableLayout="auto"
                        sticky={{ offsetHeader: 0 }}
                        pagination={false}
                        scroll={{
                            y: 600,
                        }}
                    />
                    {!!dataAllStore?.ScStoreForAgency?.total && <Pagination
                        pageSizeOptions={[5, 10, 15]}
                        defaultPageSize={5}
                        total={dataAllStore?.ScStoreForAgency?.total}
                        current={search?.page}
                        onChange={(page, pageSize) => {
                            setSearch(prev => ({
                                ...prev,
                                page: +page,
                                limit: +pageSize
                            }))
                        }}
                        showSizeChanger
                        showTotal={(total) => {
                            return `Hiển thị ${(search?.page - 1) * 5 + 1} - ${(search?.page - 1) * 5 + dataAllStore?.ScStoreForAgency?.stores?.length} của ${total}`
                        }}
                    />}
                </Flex>
            </Spin>
        </Modal>
    )
};

export default memo(ModalConnectStore);