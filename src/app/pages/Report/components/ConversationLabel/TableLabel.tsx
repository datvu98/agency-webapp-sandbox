import { FileExcelOutlined, RightOutlined } from "@ant-design/icons";
import { useLazyQuery, useQuery } from "@apollo/client";
import { Button, Card, Flex, Typography, Table, TableProps, Popover, Space, Checkbox, Empty, Spin } from "antd";
import { useReportContext } from "app/contexts/ReportContext";
import React, { memo, useCallback, useMemo, useState } from "react";
import { generateDateDefault, generateDateRange } from '../../ReportHelper';
import query_chatReportLabelDetail from "graphql/queries/query_chatReportLabelDetail";
import dayjs from "dayjs";
import { saveAs } from 'file-saver';
import classNames from "classnames";
import { flattenDeep, sumBy } from "lodash";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import query_chatReportExportLabel from "graphql/queries/query_chatReportExportLabel";

const { Text, Paragraph } = Typography;

const TableLabel = () => {
    const [selectedStores, setSelectedStores] = useState<Array<string>>([]);
    const [selectedStoresTemp, setSelectedStoresTemp] = useState<Array<string>>([]);
    const [currentLabelShow, setCurrentLabelShow] = useState<number | null>(null);
    const { variablesQuery, optionsStore } = useReportContext();

    const variables = useMemo(() => {
        return {
            ...generateDateDefault(13, true),
            ...variablesQuery
        }
    }, [variablesQuery]);

    const { loading, data } = useQuery(query_chatReportLabelDetail, {
        variables,
        fetchPolicy: 'no-cache',
    });

    const [exportChartLabel, { loading: loadingExport, data: dataExport }] = useLazyQuery(query_chatReportExportLabel, {
        fetchPolicy: 'no-cache'
    })

    const categoryChartLabel = useMemo(() => {
        return generateDateRange(variables.from, variables.to, variables?.type || 'day')
    }, [variables]);

    const dataChart = useMemo(() => {
        const mappedData = categoryChartLabel?.date?.map((category, index) => {
            return {
                title: categoryChartLabel?.range?.[index] || category,
                time: category
            }
        });

        return mappedData;
    }, [categoryChartLabel, data]);

    const flattenDeepChart = useMemo(() => {
        return flattenDeep(data?.chatReportLabelDetail?.map(item => item?.stores?.map(store => {
            return store?.data?.map(st => ({
                ...st,
                storeId: store?.id,
                labelId: item?.id
            }))
        })))
    }, [data]);

    console.log({ flattenDeepChart });

    const onExportChartLabel = useCallback(async () => {
        try {
            const { data } = await exportChartLabel({ variables });

            if (data?.chatReportExportLabel?.success) {
                saveAs(data?.chatReportExportLabel?.data);
            } else {
                showAlert.error(data?.chatReportExportLabel?.message || 'Xuất báo cáo nhãn hội thoại thất bại');
            }
        } catch (error) {
            showAlert.error('Có lỗi xảy ra, xin vui lòng thử lại')
        }
    }, [variables]);


    const columns: TableProps['columns'] = useMemo(() => {
        return [
            {
                title: 'Danh mục',
                dataIndex: 'id',
                width: 150,
                key: 'id',
                fixed: 'left',
                render: (item, record) => {
                    return <Text>{record?.title}</Text>
                }
            },
            ...((data?.chatReportLabelDetail || [])?.flatMap(item => {
                const columnLabel = [{
                    title: <Popover
                        title="Chọn gian hàng"
                        placement="bottom"
                        trigger="click"
                        open={currentLabelShow == item?.id}
                        onOpenChange={(newOpen) => {
                            setCurrentLabelShow(newOpen ? item?.id : null)
                        }}
                        content={<Space className="w-100" direction="vertical" size={15}>
                            <Flex vertical style={{ maxHeight: 200, overflowY: 'auto' }}>
                                {item?.stores.map((store: any, index: number) => {
                                    const findedStore = optionsStore?.find(st => st?.value == store?.id);
                                    const isSelected = selectedStoresTemp?.some(value => value === `${item?.id}-${store?.id}`);

                                    return (
                                        <Checkbox
                                            key={`filter-mess-${index}`}
                                            style={{ marginBottom: 4 }}
                                            checked={isSelected}
                                            onChange={() => {
                                                if (isSelected) {
                                                    setSelectedStoresTemp(st => st?.filter(prev => prev != `${item?.id}-${store?.id}`))
                                                } else {
                                                    setSelectedStoresTemp(st => st?.concat(`${item?.id}-${store?.id}`))
                                                }
                                            }}
                                        >
                                            <Flex align="center" gap={4}>
                                                <img src={findedStore?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
                                                <Typography.Text>{findedStore?.label}</Typography.Text>
                                            </Flex>
                                        </Checkbox>
                                    )
                                })}
                            </Flex>
                            <Flex align="center" justify="center">
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        setSelectedStores(selectedStoresTemp);
                                        setCurrentLabelShow(null);
                                    }}
                                >
                                    Đồng ý
                                </Button>
                            </Flex>
                        </Space>}
                    >
                        <Flex className="column-title cursor-pointer" justify="center" align="center">
                            <Paragraph
                                ellipsis={{ rows: 1, tooltip: item?.title }}
                                style={{ width: '80%', margin: 0 }}
                            >
                                {item?.title}
                            </Paragraph>
                            <RightOutlined className="icon-expand-column" />
                        </Flex>
                    </Popover>,
                    key: `${item?.id}`,
                    align: 'center',
                    children: [
                        {
                            title: 'Lượt gắn',
                            key: `${item?.id}-1`,
                            align: 'center',
                            width: 100,
                            render: (_item, record) => {
                                const flattenLabels = item?.stores?.flatMap(store => store?.data);
                                const filteredLabels = flattenLabels?.filter(label => label?.time == record?.time);
                                const totalAttachment = sumBy(filteredLabels, 'attachment') || 0;

                                return <Text>{formatNumberToCurrency(totalAttachment)}</Text>
                            }
                        },
                        {
                            title: 'Lượt gỡ',
                            key: `${item?.id}-2`,
                            align: 'center',
                            width: 100,
                            render: (_item, record) => {
                                const flattenLabels = item?.stores?.flatMap(store => store?.data);
                                const filteredLabels = flattenLabels?.filter(label => label?.time == record?.time);
                                const totalDetachment = sumBy(filteredLabels, 'detachment') || 0;

                                return <Text>{formatNumberToCurrency(totalDetachment)}</Text>
                            }
                        },
                    ],
                }];

                const columnLabelStores = item?.stores?.flatMap(store => {
                    const findedStore = optionsStore?.find(st => st?.value == store?.id);
                    const classNameStore = classNames(
                        findedStore?.channel?.code == 'shopee' && 'upbase-table-column-shopee',
                        findedStore?.channel?.code == 'lazada' && 'upbase-table-column-lazada',
                    );

                    if (!selectedStores?.includes(`${item?.id}-${store?.id}`)) return []

                    return {
                        title: <Flex justify="center" align="center" gap={4}>
                            <img src={findedStore?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
                            <Typography.Text>{findedStore?.label}</Typography.Text>
                        </Flex>,
                        className: classNameStore,
                        dataIndex: 'id-1',
                        key: `${item?.id}-${store?.id}`,
                        align: 'center',
                        children: [
                            {
                                title: 'Lượt gắn',
                                className: classNameStore,
                                dataIndex: 'id-1-1',
                                key: `${item?.id}-${store?.id}-1`,
                                width: 100,
                                align: 'center',
                                render: (_item, record) => {
                                    const attachmentLabelStore = store?.data?.find(st => st?.time == record?.time)?.attachment || 0;

                                    return <Text>{formatNumberToCurrency(attachmentLabelStore)}</Text>
                                }
                            },
                            {
                                title: 'Lượt gỡ',
                                dataIndex: 'id-1-2',
                                className: classNameStore,
                                key: `${item?.id}-${store?.id}-2`,
                                width: 100,
                                align: 'center',
                                render: (_item, record) => {
                                    const detachmentLabelStore = store?.data?.find(st => st?.time == record?.time)?.detachment || 0;

                                    return <Text>{formatNumberToCurrency(detachmentLabelStore)}</Text>
                                }
                            },
                        ],
                    }
                })

                return [...columnLabel, ...columnLabelStores]
            }))
        ]
    }, [data, optionsStore, currentLabelShow, selectedStoresTemp, selectedStores]);

    return (
        <Card>
            <Flex vertical gap={20}>
                <Flex justify="space-between" align="center">
                    <Text className="title-card" strong>Chi tiết nhãn hội thoại</Text>
                    <Button
                        type="primary"
                        className="btn-base"
                        loading={loadingExport}
                        icon={<FileExcelOutlined className="icon-base" />}
                        onClick={onExportChartLabel}
                    >
                        Xuất
                    </Button>
                </Flex>
                <Spin spinning={loading}>
                    {data?.chatReportLabelDetail?.length > 0 ? (
                        <Table
                            className='setting-table ant-upbase'
                            dataSource={dataChart}
                            columns={columns}
                            bordered
                            loading={loading}
                            pagination={false}
                            // scroll={{ x: selectedStores?.length > 0 ? 'max-content' : 'unset' }}
                            scroll={{ x: 'max-content' }}
                            sticky={{ offsetHeader: 114 }}
                            summary={(pageData) => {
                                return (<Table.Summary fixed="bottom">
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0}>Tổng</Table.Summary.Cell>
                                        {(data?.chatReportLabelDetail || []).flatMap(item => {
                                            const columnsTotalLabel = [
                                                <Table.Summary.Cell
                                                    index={1}
                                                    align="center"
                                                >
                                                    {item?.totalAttachment}
                                                </Table.Summary.Cell>,
                                                <Table.Summary.Cell
                                                    index={1}
                                                    align="center"
                                                >
                                                    {item?.totalDetachment}
                                                </Table.Summary.Cell>
                                            ]

                                            const storesTotalLabel = item?.stores?.flatMap(store => {
                                                const isShowStore = selectedStores?.includes(`${item?.id}-${store?.id}`)
                                                const findedStore = optionsStore?.find(st => st?.value == store?.id);
                                                const classNameStore = classNames(
                                                    findedStore?.channel?.code == 'shopee' && 'upbase-table-column-shopee',
                                                    findedStore?.channel?.code == 'lazada' && 'upbase-table-column-lazada'
                                                );
                                                const totalStoreDate = flattenDeepChart?.filter((chart: any) => chart?.storeId == store?.id && chart?.labelId == item?.id);
                                                const [totalAttachment, totalDetachment] = [
                                                    sumBy(totalStoreDate, (st: any) => st?.attachment || 0),
                                                    sumBy(totalStoreDate, (st: any) => st?.detachment || 0),
                                                ]

                                                if (isShowStore) {
                                                    return [
                                                        <Table.Summary.Cell
                                                            index={1}
                                                            className={classNameStore}
                                                            align="center"
                                                        >
                                                            {totalAttachment}
                                                        </Table.Summary.Cell>,
                                                        <Table.Summary.Cell
                                                            index={1}
                                                            className={classNameStore}
                                                            align="center"
                                                        >
                                                            {totalDetachment}
                                                        </Table.Summary.Cell>
                                                    ]
                                                }

                                                return []
                                            });

                                            return [...columnsTotalLabel, ...storesTotalLabel]
                                        })}
                                    </Table.Summary.Row>
                                </Table.Summary>
                                )
                            }}
                        />
                    ) : (
                        <Flex justify="center">
                            <Empty className="empty-section" description="Chưa có dữ liệu" />
                        </Flex>
                    )}
                </Spin>
            </Flex>
        </Card>
    )
};

export default memo(TableLabel);