import { PlusOutlined } from '@ant-design/icons'
import { Avatar, Button, Col, Divider, Flex, List, Modal, Row, Spin, Typography } from 'antd'
import React, { memo, useMemo } from 'react'

export interface DataStoreProps {
    id: string
    logo_asset_url: string
    code: string
    name: string
    __typename?: 'ConnectorChannel'
}

interface ModalAddAccountProps {
    show: boolean
    onHide: () => void
    onConfirm: (item: DataStoreProps) => void
    dataStore: DataStoreProps[]
    /** Chỉ hiển thị nút "Thêm" cho các item có code nằm trong danh sách này (theo registry addAccountHandlers) */
    supportedAddCodes: string[]
    loading: boolean
}

const { Text } = Typography

const chunk = <T,>(arr: T[], size: number): T[][] => {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size))
    }
    return result
}

const ModalAddAccount = ({ show, onHide, loading, dataStore, supportedAddCodes, onConfirm }: ModalAddAccountProps) => {
    const supportedSet = useMemo(
        () => new Set((supportedAddCodes ?? []).map((c) => c.toLowerCase())),
        [supportedAddCodes]
    )
    const list = useMemo(
        () =>
            (Array.isArray(dataStore) ? dataStore : []).filter((item) =>
                supportedSet.has((item.code ?? '').toLowerCase())
            ),
        [dataStore, supportedSet]
    )
    const rows = chunk(list, 2)

    return (
        <Modal
            title="Thêm tài khoản"
            open={show}
            onCancel={onHide}
            footer={
                <Flex justify="flex-end">
                    <Button type="primary" onClick={onHide}>
                        Đóng
                    </Button>
                </Flex>
            }
            centered
        >
            <Divider style={{ marginBottom: '20px' }} />
            <Spin spinning={loading}>
                {rows.length === 0 && !loading && <Text type="secondary">Không có kênh nào để thêm.</Text>}
                {rows.map((row, index) => (
                    <React.Fragment key={index}>
                        <Row gutter={24} style={{ marginBottom: '20px' }}>
                            {row.map((item) => (
                                <Col span={12} key={item.id}>
                                    <Flex justify="space-between" align="center">
                                        <Flex align="center" gap={8}>
                                            <Avatar
                                                src={item.logo_asset_url}
                                                shape="square"
                                                size={28}
                                            />
                                            <Text>{item.name}</Text>
                                        </Flex>

                                        <Button
                                            type="text"
                                            onClick={() => onConfirm(item)}
                                            style={{ color: '#ff5629', fontWeight: 500 }}
                                        >
                                            Thêm <PlusOutlined />
                                        </Button>
                                    </Flex>
                                </Col>
                            ))}
                        </Row>
                    </React.Fragment>
                ))}
            </Spin>
            <Divider style={{ marginTop: '20px' }} />
        </Modal>
    )
}

export default memo(ModalAddAccount)