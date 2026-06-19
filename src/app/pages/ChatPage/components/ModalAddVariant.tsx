import { InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { Button, Empty, Flex, Input, Modal, Spin, Table, Tooltip, Typography } from "antd";
import { useCreateOrderContext } from "app/contexts/CreateOrderContext";
import query_sme_catalog_inventory_items from "graphql/queries/query_sme_catalog_inventory_items";
import React, { memo, useMemo, useCallback, useState } from "react";
import styled from "styled-components";
import { formatNumberToCurrency } from "utils/helper";
import SkuIcon from 'assets/ic_sku.svg';

const { Text, Paragraph } = Typography;

const ModalWrapper = styled(Modal)`    
    .ant-modal-body {
        margin: 20px 0px;
    }

    .input-wrapper {
        width: 50%;
        height: 35px;
    }
`;

const MAX_VARIANT_ADD = 30;

const ModalAddVariant = ({
    show,
    onHide,
    onAddVariantsOrder
}) => {
    const { smeWarehouseSelected } = useCreateOrderContext();
    const [dataCombo, setDataCombo] = useState<any>(null);
    const [variantSelect, setVariantSelect] = useState<any[]>([]);
    const [selectedVariants, setSelectedVariants] = useState<any>([]);
    const [search, setSearch] = useState<any>({
        searchText: null,
        searchType: '',
        page: 1,
        limit: 20,
    });

    const { data, loading } = useQuery(query_sme_catalog_inventory_items, {
        variables: {
            limit: search.limit,
            offset: (search.page - 1) * search.limit,
            where: {
                ...(!!search.searchText ? {
                    _or: [
                        { variant: { sme_catalog_product: { name: { _ilike: `%${search.searchText.trim()}%` } } } },
                        { variant: { sku: { _ilike: `%${search.searchText.trim()}%` } } },
                    ],
                } : ""),
                sme_store_id: {
                    _eq: smeWarehouseSelected?.value
                },
                variant: { product_status_id: { _is_null: true } }
            },
            order_by: {
                updated_at: 'desc',
                variant_id: 'desc',
                stock_actual: 'desc_nulls_last'
            }
        },
        fetchPolicy: 'cache-and-network'
    });

    const dataInventoryItems = useMemo(() => {
        return data?.sme_catalog_inventory_items?.map(item => ({
            ...item,
            key: `${item?.variant_id}-${item?.sme_store?.id}`
        })) || []
    }, [data?.sme_catalog_inventory_items]);

    const rowSelection = useMemo(() => {
        return {
            selectedRowKeys: selectedVariants?.map(variant => variant?.key),
            onChange: (selectedRowKeys: React.Key[], selectedRows) => {
                console.log({ selectedRows })
                setSelectedVariants(selectedRows)
                // setSelectedVariants(prev => {
                //     const newVariants = [...new Set(prev.concat(selectedRows))]
                //     return newVariants
                // });
            },
        }
    }, [selectedVariants]);

    const columns = [
        {
            title: 'Hàng hóa kho',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            width: '35%',
            render: (_item, record: any) => {
                return <Flex vertical gap={2}>
                    <Paragraph
                        className="text-paragraph cursor-pointer"
                        style={{ margin: 0 }}
                        ellipsis={{ rows: 2 }}
                        onClick={() => {
                            let url = "";
                            if (record?.variant?.is_combo) {
                                url = `/products/edit-combo/${record?.variant?.sme_catalog_product?.id}`;
                            } else if (record?.variant?.attributes?.length > 0) {
                                url = `/products/stocks/detail/${record?.variant?.id}`;
                            } else {
                                url = `/products/edit/${record?.variant?.sme_catalog_product?.id}`;
                            }

                            window.open(`${process.env.REACT_APP_SME_ENDPOINT}${url}`, "_blank");
                        }}
                        copyable
                    >
                        {record?.variant?.sme_catalog_product?.name}
                    </Paragraph>
                    {record?.variant?.attributes?.length > 0 && <Text type="secondary">{record?.variant?.name?.replaceAll(' + ', ' - ')}</Text>}
                </Flex>
            }
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            align: 'center',
            width: '35%',
            render: (_item, record: any) => {
                return <Flex align="center" gap={4}>
                    <Flex className="w-100" align="center" gap={4}>
                        <img
                            className="icon-sku"
                            src={SkuIcon}
                        />
                        <Paragraph
                            className="text-paragraph"
                            style={{ margin: 0 }}
                            ellipsis={{ rows: 1 }}
                            copyable
                        >
                            {record?.variant?.sku}
                        </Paragraph>
                    </Flex>
                </Flex>
            }
        },
        {
            title: 'Kho vật lý',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: '15%',
            render: (_item, record: any) => {
                return (
                    <Text>{record?.sme_store?.name || '--'}</Text>
                )
            }
        },
        {
            title: 'Tồn sẵn sàng bán',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: '15%',
            render: (_item, record) => {
                const stockAvaiable = record?.variant?.inventories?.find(iv => iv?.sme_store_id == smeWarehouseSelected?.value)?.stock_available;

                return (
                    <Text>{formatNumberToCurrency(stockAvaiable)}</Text>
                )
            }
        },
    ];

    const onCloseModal = useCallback(() => {
        onHide();
    }, []);

    return (
        <ModalWrapper
            open={show}
            title="Thêm hàng hóa kho"
            width={"70%"}
            closable={false}
            onCancel={onCloseModal}
            footer={[
                <Flex align="center" justify="flex-end">
                    <Flex align="center" gap={20}>
                        <Button
                            type="primary"
                            className="btn-base btn-cancel"
                            // disabled={loading}
                            onClick={onCloseModal}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            className="btn-base"
                            onClick={() => {
                                onAddVariantsOrder(selectedVariants);
                                onCloseModal();
                            }}
                        >
                            Xác nhận
                        </Button>
                    </Flex>
                </Flex>
            ]}
        >
            <Spin spinning={false}>
                <Flex vertical gap={10}>
                    <Input
                        className="input-wrapper"
                        placeholder="Tên/SKU"
                        prefix={<SearchOutlined />}
                        onBlur={(e) => {
                            setSearch({ ...search, searchText: e.target.value, page: 1 })
                        }}
                        onKeyDown={(e: any) => {
                            if (e.keyCode == 13) {
                                setSearch({ ...search, searchText: e.target.value, page: 1 })
                            }
                        }}
                    />
                    <Flex align="center" gap={8}>
                        <Text>Đã chọn: {selectedVariants?.length} / {MAX_VARIANT_ADD}</Text>
                        <Tooltip title="Số lượng hàng hóa đã chọn" placement="bottom">
                            <InfoCircleOutlined />
                        </Tooltip>
                    </Flex>
                    <Table
                        className="upbase-table"
                        columns={columns as any}
                        bordered
                        loading={loading}
                        rowSelection={{
                            type: 'checkbox',
                            ...rowSelection,
                        }}
                        locale={{
                            emptyText: <Flex className="empty-table" vertical justify="center" align="center">
                                <Empty className="icon-empty-table" description={false} />
                                <Text>Chưa có sản phẩm</Text>
                            </Flex>
                        }}
                        dataSource={dataInventoryItems}
                        pagination={{
                            size: 'default',
                            pageSize: search?.limit,
                            total: data?.sme_catalog_inventory_items_aggregate?.aggregate?.count || 0,
                            current: search?.page,
                            showTotal: (total: any) => <Text>Tổng số {total}</Text>,
                        }}
                        onChange={(pagination) => {
                            setSearch(prev => ({ ...prev, page: pagination?.current || 1 }))
                        }}
                        tableLayout="auto"
                        scroll={{ y: 320 }}
                        sticky={{ offsetHeader: 0 }}
                    />
                </Flex>
            </Spin>
        </ModalWrapper>
    )
};

export default memo(ModalAddVariant);