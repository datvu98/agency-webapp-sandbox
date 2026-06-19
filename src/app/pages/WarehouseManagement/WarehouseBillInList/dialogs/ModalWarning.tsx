import React, { memo, useMemo } from "react";
import { Modal, Button, Flex, Typography, Table } from "antd";
import { formatNumberToCurrency } from "utils/helper";
import client from "apollo";
import query_sme_catalog_product_variant_stock from "graphql/queries/query_sme_catalog_product_variant_stock";
import { useQuery } from "@apollo/client";

interface ModalWarningProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    dataError: any;
}
const {Text} = Typography

const ModalWarning: React.FC<ModalWarningProps> = memo(({ show, onHide, onConfirm, dataError }) => {

    const {data: dataVariant} = useQuery(query_sme_catalog_product_variant_stock, {
        variables: {
            where: {
				id: { _in: dataError?.map(err => err?.variantId) },
			},
        },
        fetchPolicy: 'cache-and-network'
    })

    const dataTable = useMemo(() => {
        if (!dataVariant?.sme_catalog_product_variant?.length) return []
        return dataError?.map(err => {
            const currVariant = dataVariant?.sme_catalog_product_variant?.find(_var => _var?.id == err?.variantId)
            return {
                ...err,
                sku: currVariant?.sku
            }
        })
    }, [dataVariant, dataError])

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: '50%',
            render: (item, record) => {
                return (
                    <Text>{record?.sku}</Text>
                )
            }
        },
        {
            title: 'Số lượng chênh lệch',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '50%%',
            render: (item, record) => {
                return <Text>{formatNumberToCurrency(Math.abs(record?.quantityActual - record?.quantityExpected))}</Text>
            }
        },
    ]
    return (
        <Modal open={show} centered footer={null} onCancel={onHide} destroyOnClose>
            <Text strong>
                Phiếu nhập có phát sinh chênh lệch so với yêu cầu nhập hàng, kiểm tra lại trước khi hoàn thành.
            </Text>
            <Table
                rowKey={'id'}
                className="upbase-table"
                columns={columns as any}
                bordered
                dataSource={ dataTable || []}
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
            <Flex justify="center">
                <Button type="primary" className="btn-base" onClick={onConfirm}>
                    Xác nhận
                </Button>
            </Flex>
        </Modal>
    );
});

export default ModalWarning;
