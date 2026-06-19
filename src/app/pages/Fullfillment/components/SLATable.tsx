import { Button, Card, Flex, Typography, Table, TableProps, Popover, Space, Checkbox, Empty, Tooltip } from "antd";
import React, { memo, useCallback, useMemo, useState } from "react";
import ModalQuantityStatus from "./ModalQuantityStatus";
const { Text } = Typography;


const SLATable = (props: { title: string, data: any, type: string, variables: any }) => {
    const [dataModal, setDataModal] = useState(null)
    const [pivot, setPivot] = useState('')
    const [status, setStatus] = useState('')
    const transformData = useMemo(() => {
        if (props?.type == 'in-time') {
            return [
                {
                    sla_category: "N < 6h",
                    code: '<6',
                    packed: props?.data?.find(item => item.pack_status === "packed")?.in_sla_6h || 0,
                    pending: props?.data?.find(item => item.pack_status === "pending")?.in_sla_6h || 0,
                    packing: props?.data?.find(item => item.pack_status === "packing")?.in_sla_6h || 0
                },
                {
                    sla_category: "6h <= N < 9h",
                    code: '<9',
                    packed: props?.data?.find(item => item.pack_status === "packed")?.in_sla_6h_9h || 0,
                    pending: props?.data?.find(item => item.pack_status === "pending")?.in_sla_6h_9h || 0,
                    packing: props?.data?.find(item => item.pack_status === "packing")?.in_sla_6h_9h || 0
                },
                {
                    sla_category: "9h <= N < 12h",
                    code: '<12',
                    packed: props?.data?.find(item => item.pack_status === "packed")?.in_sla_9h_12h || 0,
                    pending: props?.data?.find(item => item.pack_status === "pending")?.in_sla_9h_12h || 0,
                    packing: props?.data?.find(item => item.pack_status === "packing")?.in_sla_9h_12h || 0
                },
                {
                    sla_category: "12h <= N < 24h",
                    code: '<24',
                    packed: props?.data?.find(item => item.pack_status === "packed")?.in_sla_over_12h || 0,
                    pending: props?.data?.find(item => item.pack_status === "pending")?.in_sla_over_12h || 0,
                    packing: props?.data?.find(item => item.pack_status === "packing")?.in_sla_over_12h || 0
                },
                {
                    sla_category: "24h <= N < 2 ngày",
                    code: '<2d',
                    packed: props?.data?.find(item => item.pack_status === "packed")?.in_sla_over_1d_2d || 0,
                    pending: props?.data?.find(item => item.pack_status === "pending")?.in_sla_over_1d_2d || 0,
                    packing: props?.data?.find(item => item.pack_status === "packing")?.in_sla_over_1d_2d || 0
                },
                {
                    sla_category: "2 ngày <= N < 3 ngày",
                    code: '<3d',
                    packed: props?.data?.find(item => item.pack_status === "packed")?.in_sla_over_2d_3d || 0,
                    pending: props?.data?.find(item => item.pack_status === "pending")?.in_sla_over_2d_3d || 0,
                    packing: props?.data?.find(item => item.pack_status === "packing")?.in_sla_over_2d_3d || 0
                },
                {
                    sla_category: "N >= 3 ngày",
                    code: '>3d',
                    packed: props?.data?.find(item => item.pack_status === "packed")?.in_sla_over_3d || 0,
                    pending: props?.data?.find(item => item.pack_status === "pending")?.in_sla_over_3d || 0,
                    packing: props?.data?.find(item => item.pack_status === "packing")?.in_sla_over_3d || 0
                }
            ];
        }
        return [
            {
                sla_category: "M < 6h",
                code: '<6',
                packed: props?.data?.find(item => item.pack_status === "packed")?.out_sla_6h || 0,
                pending: props?.data?.find(item => item.pack_status === "pending")?.out_sla_6h || 0,
                packing: props?.data?.find(item => item.pack_status === "packing")?.out_sla_6h || 0
            },
            {
                sla_category: "6h <= M < 9h",
                code: '<9',
                packed: props?.data?.find(item => item.pack_status === "packed")?.out_sla_6h_9h || 0,
                pending: props?.data?.find(item => item.pack_status === "pending")?.out_sla_6h_9h || 0,
                packing: props?.data?.find(item => item.pack_status === "packing")?.out_sla_6h_9h || 0
            },
            {
                sla_category: "9h <= M < 12h",
                code: '<12',
                packed: props?.data?.find(item => item.pack_status === "packed")?.out_sla_9h_12h || 0,
                pending: props?.data?.find(item => item.pack_status === "pending")?.out_sla_9h_12h || 0,
                packing: props?.data?.find(item => item.pack_status === "packing")?.out_sla_9h_12h || 0
            },
            {
                sla_category: "12h <= M < 24h",
                code: '<24',
                packed: props?.data?.find(item => item.pack_status === "packed")?.out_sla_over_12h || 0,
                pending: props?.data?.find(item => item.pack_status === "pending")?.out_sla_over_12h || 0,
                packing: props?.data?.find(item => item.pack_status === "packing")?.out_sla_over_12h || 0
            },
            {
                sla_category: "24h <= M < 2 ngày",
                code: '<2d',
                packed: props?.data?.find(item => item.pack_status === "packed")?.out_sla_over_1d_2d || 0,
                pending: props?.data?.find(item => item.pack_status === "pending")?.out_sla_over_1d_2d || 0,
                packing: props?.data?.find(item => item.pack_status === "packing")?.out_sla_over_1d_2d || 0
            },
            {
                sla_category: "2 ngày <= M < 3 ngày",
                code: '<3d',
                packed: props?.data?.find(item => item.pack_status === "packed")?.out_sla_over_2d_3d || 0,
                pending: props?.data?.find(item => item.pack_status === "pending")?.out_sla_over_2d_3d || 0,
                packing: props?.data?.find(item => item.pack_status === "packing")?.out_sla_over_2d_3d || 0
            },
            {
                sla_category: "M >= 3 ngày",
                code: '>3d',
                packed: props?.data?.find(item => item.pack_status === "packed")?.out_sla_over_3d || 0,
                pending: props?.data?.find(item => item.pack_status === "pending")?.out_sla_over_3d || 0,
                packing: props?.data?.find(item => item.pack_status === "packing")?.out_sla_over_3d || 0
            }
        ];
    }, [props?.data, props?.type]);

    const handleClick = (record) => {
        if (props?.type == 'in-time') {
            let sla_time
            switch (record?.code) {
                case '<6':
                    sla_time = 1;
                    break;
                case '<9':
                    sla_time = 2;
                    break;
                case '<12':
                    sla_time = 3;
                    break;
                case '<24':
                    sla_time = 4;
                    break;
                case '<2d':
                    sla_time = 9;
                    break;
                case '<3d':
                    sla_time = 10;
                    break;
                case '>3d':
                    sla_time = 11;
                    break;
                default:
                    sla_time = 1;
            }
            setDataModal({
                ...props?.variables,
                filter: {
                    ...props?.variables?.filter,
                    sla_time
                }
            })
        } else {
            let sla_time
            switch (record?.code) {
                case '<6':
                    sla_time = 5;
                    break;
                case '<9':
                    sla_time = 6;
                    break;
                case '<12':
                    sla_time = 7;
                    break;
                case '<24':
                    sla_time = 8;
                    break;
                case '<2d':
                    sla_time = 12;
                    break;
                case '<3d':
                    sla_time = 13;
                    break;
                case '>3d':
                    sla_time = 14;
                    break;
                default:
                    sla_time = 5;
            }
            setDataModal({
                ...props?.variables,
                filter: {
                    ...props?.variables?.filter,
                    sla_time
                }
            })
        }
    }

    const columns: TableProps['columns'] = useMemo(() => {
        return [
            {
                title: props?.type == 'in-time' ? 'Thời gian còn so với hạn' : 'Thời gian trễ',
                dataIndex: 'id',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text strong>{record?.sla_category}</Text>
                },
                align: 'left',
                fixed: true
            },
            {
                title: 'Chờ đóng gói',
                dataIndex: 'sme',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: !!record?.pending ? '#ff5629' : 'black' }} onClick={() => {
                        if (record?.pending == 0) {
                            return
                        }
                        handleClick(record)
                        setStatus('pending')
                        setPivot(record?.sla_category)
                    }}>{record?.pending}</Text>
                },
                align: 'right',
            },
            {
                title: 'Đang đóng gói',
                dataIndex: 'gmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: !!record?.packing ? '#ff5629' : 'black' }} onClick={() => {
                        if (record?.packing == 0) {
                            return
                        }
                        handleClick(record)
                        setStatus('packing')
                        setPivot(record?.sla_category)
                    }}>{record?.packing}</Text>
                },
                align: 'right',

            },
            {
                title: 'Chờ lấy hàng',
                dataIndex: 'nmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: !!record?.packed ? '#ff5629' : 'black' }} onClick={() => {
                        if (record?.packed == 0) {
                            return
                        }
                        handleClick(record)
                        setStatus('packed')
                        setPivot(record?.sla_category)
                    }}>{record?.packed}</Text>
                },
                align: 'right',

            },
        ]
    }, []);

    return (
        <Flex vertical gap={20}>
            {!!dataModal && <ModalQuantityStatus open={!!dataModal}
                title='Số lượng đơn theo gian hàng'
                dataModal={dataModal}
                onHide={() => setDataModal(null)}
                status={status}
                pivot={pivot}
            />}
            <Flex justify="space-between" align="center">
                <Text className="title-card" strong>{props?.title}</Text>
            </Flex>
            <Table
                className='setting-table ant-upbase'
                dataSource={transformData}
                columns={columns}
                bordered
                pagination={false}
                scroll={{ x: 'max-content' }}
                sticky={{ offsetHeader: 114 }}
            />
        </Flex>
    )
};

export default SLATable;
