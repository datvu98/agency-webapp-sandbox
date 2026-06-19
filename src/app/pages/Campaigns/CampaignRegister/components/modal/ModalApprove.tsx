import { DeleteOutlined, WarningFilled } from '@ant-design/icons';
import { Button, Flex, Image, Modal, Typography } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'

const { Text } = Typography;

interface IProduct {
    id: number
    productName: string
    image: string
    variantSku: string
    variantName: string
    variantImage: string
    quantityPurchased: number
}

interface ModalApproveProps {
    open: boolean
    onCancel: () => void
    onConfirm: (remainingRequestItemIds: number[], shouldCheckStock?: number) => void | Promise<void>
    loading?: boolean
    dataProduct: IProduct[]
    checkItemsStock: (ids: number[]) => Promise<number[]>
}

const ModalApprove = ({ open, onCancel, onConfirm, loading, dataProduct, checkItemsStock }: ModalApproveProps) => {
    const [remainingIds, setRemainingIds] = useState<number[]>([]);
    const [didAutoClose, setDidAutoClose] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [outOfStockIds, setOutOfStockIds] = useState<number[]>([]);

    useEffect(() => {
        if (!open) return;
        setInitialized(false);
        const ids = (dataProduct ?? []).map((p) => p.id);
        setRemainingIds(ids);
        setOutOfStockIds([]);
        setDidAutoClose(false);
        setInitialized(true);
        if (ids.length > 0) {
            checkItemsStock(ids).then(setOutOfStockIds);
        }
    }, [open]);

    const remainingProducts = useMemo(
        () => (dataProduct ?? []).filter((p) => remainingIds.includes(p.id)),
        [dataProduct, remainingIds]
    );

    useEffect(() => {
        if (!open) return;
        if (loading) return;
        if (!initialized) return;
        if (remainingIds.length > 0) return;
        if (didAutoClose) return;

        setDidAutoClose(true);
        onCancel();
    }, [didAutoClose, initialized, loading, onCancel, open, remainingIds.length]);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title={<Text style={{ fontSize: 18, fontWeight: 600 }}>Xác nhận nhà sáng tạo tham gia chiến dịch</Text>}
            centered
            maskClosable={!loading}
            closable={!loading}
            style={{ padding: 16 }}
            width={650}
        >
            <Flex vertical gap={16} style={{ maxHeight: 500, overflowY: 'auto', margin: '24px' }}>
                {remainingProducts.map((product) => (
                    <Flex key={product.id} vertical gap={0}>
                        <Flex align='center' gap={10} style={{ width: '100%', padding: 8, borderRadius: outOfStockIds.includes(product.id) ? '8px 8px 0 0' : 8, border: '1px solid #e0e0e0', borderBottom: outOfStockIds.includes(product.id) ? 'none' : '1px solid #e0e0e0', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}>
                            <Image src={product.variantImage} alt={product.productName} width={60} height={60} style={{ borderRadius: 8, objectFit: 'cover' }} />
                            <Flex vertical gap={2} style={{ flex: 1 }}>
                                <Flex align='center' justify='space-between' gap={10}>
                                    <Text strong>{product.productName}</Text>
                                    <Text type='secondary' style={{ fontSize: 12, whiteSpace: 'nowrap' }}>x{product.quantityPurchased}</Text>
                                </Flex>
                                <Text type='secondary' style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{product.variantSku}</Text>
                                <Text type='secondary' style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{product.variantName}</Text>
                            </Flex>
                            <DeleteOutlined
                                style={{ color: 'gray', fontSize: 18, cursor: 'pointer', marginLeft: 6 }}
                                onClick={() => {
                                    if (loading) return;
                                    const newIds = remainingIds.filter((id) => id !== product.id);
                                    setRemainingIds(newIds);
                                    setOutOfStockIds((prev) => prev.filter((id) => id !== product.id));
                                    if (newIds.length > 0) {
                                        checkItemsStock(newIds).then(setOutOfStockIds);
                                    }
                                }}
                            />
                        </Flex>
                        {outOfStockIds.includes(product.id) && (
                            <Flex align='center' gap={8} style={{ padding: '8px 12px', borderRadius: '0 0 8px 8px', border: '1px solid #faad14', background: '#fffbe6' }}>
                                <WarningFilled style={{ color: '#faad14', fontSize: 14, flexShrink: 0 }} />
                                <Text style={{ fontSize: 12, color: '#ad6800' }}>
                                    Sản phẩm đã hết hàng. Vui lòng xóa hoặc đề nghị nhà bán hàng bổ sung thêm để tránh gián đoạn xử lý đơn.
                                </Text>
                            </Flex>
                        )}
                    </Flex>
                ))}
            </Flex>
            <Flex justify='flex-end' gap={10} >
                <Button type='default' onClick={onCancel} disabled={loading}>Hủy</Button>
                <Button
                    type='primary'
                    onClick={() => {
                        const hasOutOfStock = remainingIds.some((id) => outOfStockIds.includes(id));
                        onConfirm(remainingIds, hasOutOfStock ? 0 : undefined);
                    }}
                    disabled={!remainingIds.length}
                    loading={loading}
                >
                    Xác nhận
                </Button>
            </Flex>
        </Modal>
    )
}

export default ModalApprove