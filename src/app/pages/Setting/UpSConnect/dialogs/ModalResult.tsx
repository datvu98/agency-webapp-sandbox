import { Button, Checkbox, Col, Flex, Input, Modal, Radio, Row, Spin, Table, Tooltip, Typography } from "antd";
import React, { memo } from "react";

interface ModalResultProps {
    open: boolean,
    onHide: () => void,
    result?: any
}

const { Text } = Typography


const ModalResult = ({
    open,
    onHide,
    result
}: ModalResultProps) => {
    const columns = [
        {
            title: 'Store ID',
            dataIndex: 'id',
            key: 'id',
            width: '15%',
            fixed: 'left',
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
            title: 'UpS ID',
            dataIndex: 'ups',
            key: 'ups',
            width: '15%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <Text>{record?.sme_id || '--'}</Text>
            }
        },
        {
            title: 'Mã lỗi',
            dataIndex: 'name',
            key: 'name',
            width: '35%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <><Text>{record?.message || '--'}</Text>
                </>
            }
        },
    ]

    return (
        <Modal
            title={'Kết quả xử lý'}
            open={open}
            width={1200}
            closable={false}
            style={{ textAlign: 'left', top: '30%' }}
            footer={[
                <Flex className="w-100" align="center" gap={20} justify="end">
                    <Button
                        type="primary"
                        className="btn-base"
                        onClick={onHide}
                    >
                        Đóng
                    </Button>
                </Flex>
            ]}
        >
            <Spin spinning={false}>
                <Flex vertical gap={20}>

                    <Table
                        rowKey={'id'}
                        className="upbase-table"
                        columns={columns as any}
                        bordered
                        dataSource={result || []}
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
                </Flex>
            </Spin>
        </Modal>
    )
};

export default memo(ModalResult);