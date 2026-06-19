import { Flex, Table, Typography } from 'antd';
import { TableProps } from 'antd/lib/table';
import React, { useMemo, useState } from 'react'
import ModalQuantityStatus from './ModalQuantityStatus';
const { Text } = Typography;


const CBHTable = (props: { title: string, data: any, type: string, variables: any }) => {
    const [dataModal, setDataModal] = useState(null)
    const [pivot, setPivot] = useState('')
    const [status, setStatus] = useState('')
    const transformData = useMemo(() => {
        if (props?.type == 'in-time') {
            return [
                {
                    sla_category: "N < 1.5h",
                    code: '<1.5',
                    pending: props?.data?.reduce((acc, item) => acc + item?.in_sla_1h30p, 0) || 0,
                },
                {
                    sla_category: "1.5h <= N < 12h",
                    code: '<12',
                    pending: props?.data?.reduce((acc, item) => acc + item?.in_sla_1h30p_12h, 0) || 0,
                },
                {
                    sla_category: "N >= 12h",
                    code: '>12',
                    pending: props?.data?.reduce((acc, item) => acc + item?.in_sla_over_12h, 0) || 0,
                },
                {
                    sla_category: "24h <= N < 2 ngày",
                    code: '<2d',
                    pending: props?.data?.reduce((acc, item) => acc + item?.in_sla_over_1d_2d, 0) || 0,
                },
                {
                    sla_category: "N >= 2 ngày",
                    code: '>2d',
                    pending: props?.data?.reduce((acc, item) => acc + item?.in_sla_over_2d, 0) || 0,
                },
            ];
        }
        return [
            {
                sla_category: "M < 1.5h",
                code: '<1.5',
                pending: props?.data?.reduce((acc, item) => acc + item?.out_sla_1h30p, 0) || 0,
            },
            {
                sla_category: "1.5h <= M < 12h",
                code: '<12',
                pending: props?.data?.reduce((acc, item) => acc + item?.out_sla_1h30p_12h, 0) || 0,
            },
            {
                sla_category: "M >= 12h",
                code: '>12',
                pending: props?.data?.reduce((acc, item) => acc + item?.out_sla_over_12h, 0) || 0,
            },
            {
                sla_category: "24h <= M < 2 ngày",
                code: '<2d',
                pending: props?.data?.reduce((acc, item) => acc + item?.out_sla_over_1d_2d, 0) || 0,
            },
            {
                sla_category: "M >= 2 ngày",
                code: '>2d',
                pending: props?.data?.reduce((acc, item) => acc + item?.out_sla_over_2d, 0) || 0,
            }
        ];
    }, [props?.data, props?.type]);

    const handleClick = (record) => {
        if (props?.type == 'in-time') {
            let rts_sla_time
            switch (record?.code) {
                case '<1.5':
                    rts_sla_time = 1;
                    break;
                case '<12':
                    rts_sla_time = 2;
                    break;
                case '>12':
                    rts_sla_time = 3;
                    break;
                case '<2d':
                    rts_sla_time = 4;
                    break;
                case '>2d':
                    rts_sla_time = 5;
                    break;
                default:
                    rts_sla_time = 1;
            }
            setDataModal({
                ...props?.variables,
                filter: {
                    ...props?.variables?.filter,
                    rts_sla_time
                }
            })
        } else {
            let rts_sla_time
            switch (record?.code) {
                case '<1.5':
                    rts_sla_time = 6;
                    break;
                case '<12':
                    rts_sla_time = 7;
                    break;
                case '>12':
                    rts_sla_time = 8;
                    break;
                case '<2d':
                    rts_sla_time = 9;
                    break;
                case '>2d':
                    rts_sla_time = 10;
                    break;
                default:
                    rts_sla_time = 6;
            }
            setDataModal({
                ...props?.variables,
                filter: {
                    ...props?.variables?.filter,
                    rts_sla_time
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
                align: 'center',
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
                filterStore={true}
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
}

export default CBHTable