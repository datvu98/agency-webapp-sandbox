import { useQuery } from "@apollo/client";
import { Button, Checkbox, Col, DatePicker, Flex, Input, Modal, Radio, Row, Spin, Table, Tooltip, Typography } from "antd";
import query_smeStore from "graphql/queries/query_smeStore";
import React, { memo, useCallback, useMemo, useState } from "react";
import type { GetProps } from 'antd';
import dayjs from "dayjs";

interface ModalConfigConnectTimeProps {
    open: boolean,
    isEditing?: boolean,
    stores: any,
    onConfirm: (stores: any) => void,
    onHide: () => void
}

const { Text } = Typography

type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;


const ModalConfigConnectTime = ({
    open,
    stores,
    onConfirm,
    onHide,
    isEditing
}: ModalConfigConnectTimeProps) => {
    const [configStores, setConfigStores] = useState(stores)
    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
        // Can not select days before today and today
        return current && current < dayjs().endOf('day');
    };

    const columns = [
        {
            title: 'Store ID',
            dataIndex: 'id',
            key: 'id',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return (
                    <Text>{record?.value || record?.store_id}</Text>
                )
            }
        },
        {
            title: 'Tên gian hàng',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
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
            title: 'Thời gian hết hạn hợp đồng',
            dataIndex: 'time',
            key: 'time',
            width: '50%',
            fixed: 'left',
            align: 'center',
            render: (item, record) => {
                return <DatePicker
                    className="w-100"
                    format='DD/MM/YYYY'
                    onChange={(day) => {
                        let timeStamp = dayjs(day).unix()
                        const newStores = configStores?.map(st => {
                            if (st?.id == record?.id) {
                                return {
                                    ...st,
                                    last_contract_expired_at: timeStamp
                                }
                            }
                            return st

                        })
                        setConfigStores(newStores)
                    }}
                    disabledDate={disabledDate}
                    allowClear={false}
                    placeholder="Chọn thời gian hết hạn hợp đồng"
                    defaultValue={isEditing && stores?.[0]?.last_contract_expired_at ? dayjs(stores?.[0]?.last_contract_expired_at, 'YYYY-MM-DD HH:mm:ss') : null}
                />
            }
        },
    ]
    return (
        <Modal
            title={'Nhập thông tin hết hạn hợp đồng'}
            open={open}
            width={1200}
            closable={false}
            style={{ textAlign: 'left' }}
            footer={[
                <Flex className="w-100" align="center" gap={20} justify="end">
                    <Button
                        type="primary"
                        className="btn-base btn-cancel"
                        onClick={onHide}
                    >
                        Huỷ
                    </Button>
                    <Button
                        type="primary"
                        className="btn-base"
                        onClick={() => {
                            onConfirm(configStores)
                        }}
                    >
                        {isEditing ? 'Lưu lại' : 'Thêm'}
                    </Button>
                </Flex>
            ]}
        >
            <Flex vertical gap={20}>
                <Table
                    className="upbase-table"
                    columns={columns as any}
                    bordered
                    dataSource={stores || []}
                    tableLayout="auto"
                    sticky={{ offsetHeader: 0 }}
                    pagination={{
                        showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total}`,
                        pageSize: 5,
                    }}
                    scroll={{
                        y: 600,
                    }}
                />
            </Flex>
        </Modal>
    )
};

export default memo(ModalConfigConnectTime);