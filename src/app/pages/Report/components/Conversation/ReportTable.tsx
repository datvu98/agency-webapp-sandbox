import { FileExcelOutlined, RightOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useLazyQuery, useQuery } from "@apollo/client";
import { Button, Card, Flex, Typography, Table, TableProps, Popover, Space, Checkbox, Empty, Tooltip, Spin } from "antd";
import { useReportContext } from "app/contexts/ReportContext";
import React, { memo, useCallback, useMemo, useState } from "react";
import { generateAvgTimestamp, generateDateDefault, generateDateRange } from "../../ReportHelper";
import query_report_stores_statics from "graphql/queries/query_report_stores_statics";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { sumBy } from "lodash";
import query_smeStore from "graphql/queries/query_smeStore";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
import { title } from "process";
const { Text } = Typography;

const formatToBMK = (num) => {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(2) + "B";
    } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(2) + "M";
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(2) + "K";
    } else {
        return num.toFixed(2); // Keep the precision for smaller numbers
    }
};

const ReportTable = () => {
    const [selectedStores, setSelectedStores] = useState<Array<string>>([]);
    const [selectedStoresTemp, setSelectedStoresTemp] = useState<Array<string>>([]);
    const [currentLabelShow, setCurrentLabelShow] = useState<number | null>(null);
    const { variablesQuery, optionsStore, optionSmes } = useReportContext();

    const variables = useMemo(() => {
        return {
            ...generateDateDefault(29, true),
            ...variablesQuery,
        };
    }, [variablesQuery]);
    const { loading, data } = useQuery(query_report_stores_statics, {
        variables,
        fetchPolicy: "no-cache",
    });

    const { data: dataStores } = useQuery(query_smeStore, {
        fetchPolicy: "cache-and-network",
    });

    const { data: dataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        variables: {
            status: [0, 1],
        },
        fetchPolicy: "cache-and-network",
    });

    const storeList = useMemo(() => {
        const stores = dataStores?.scAgencySaleStores?.data
            ?.filter((store) => {
                return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map((item) => item?.store_id)?.includes(store?.id);
            })
            ?.map((store) => {
                const channel = dataStores?.op_connector_channels?.find((cn) => cn?.code == store?.connector_channel_code);
                return {
                    ...store,
                    channel,
                    value: store?.id,
                    label: store?.name,
                };
            });
        return stores || [];
    }, [dataStores, dataScListConnectorStoreAgency]);

    const categoryChartLabel = useMemo(() => {
        return generateDateRange(variables.from, variables.to, variables?.type || "day");
    }, [variables]);

    const dataChart = useMemo(() => {
        const mappedData = categoryChartLabel?.date?.map((category, index) => {
            return {
                title: categoryChartLabel?.range?.[index] || category,
                time: category,
            };
        });

        return mappedData;
    }, [categoryChartLabel, data]);
    const contentPopUp = (data, dataPrev) => {
        return (
            <Flex vertical align="end">
                <Text>Kì này: {formatNumberToCurrency(data)}</Text>
                <Text>Kì trước: {formatNumberToCurrency(dataPrev)}</Text>
            </Flex>
        );
    };

    const columns: TableProps['columns'] = useMemo(() => {
        if (!data?.report_stores_statics) return []
        let initial = [{
            title: "Thông tin gian hàng",
            dataIndex: "id",
            width: 200,
            key: "id",
            render: (item, record) => {
                const store = storeList?.find((op) => op?.value == record?.storeId);
                return (
                    <Flex gap={4} align="center" style={{ maxWidth: 200 }} justify="start">
                        <img src={store?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
                        <Tooltip title={store?.label}>
                            <Text ellipsis style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {store?.label}
                            </Text>
                        </Tooltip>
                    </Flex>
                );
            },
            align: "left",
            fixed: true,
        },
        {
            title: "UpS",
            dataIndex: "sme",
            width: 200,
            key: "id",
            render: (item, record) => {
                const sme = optionSmes?.find((item) => item?.value == record?.smeId);
                return (
                    <Tooltip title={sme?.label}>
                        <Text ellipsis style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {sme?.label}
                        </Text>
                    </Tooltip>
                );
            },
            align: "left",
            sorter: (a, b) => {
                const smeA = optionSmes?.find((item) => item?.value == a?.smeId)?.label || "";
                const smeB = optionSmes?.find((item) => item?.value == b?.smeId)?.label || "";
                return smeA.localeCompare(smeB);
            },
        },]
        let list = data?.report_stores_statics?.[0]?.items?.map(statistic => {
            return {
                title: statistic?.title,
                width: 200,
                key: statistic?.title,
                render: (item, record) => {
                    const static_record = record?.items?.find(it => it?.title == statistic?.title)
                    return (
                        <Popover
                            placement="topRight"
                            content={contentPopUp(static_record?.value, static_record?.prevValue)}
                            style={{ display: "flex", justifyItems: "center", alignItems: "center" }}
                        >
                            <Flex justify="end" style={{ color: "#000" }}>
                                {formatToBMK(static_record?.value)}
                                ({static_record?.increase > 0 ? (
                                    <CaretUpOutlined style={{ color: "green" }} />
                                ) : static_record?.increase < 0 ? (
                                    <CaretDownOutlined style={{ color: "red" }} />
                                ) : (
                                    <></>
                                )}
                                {Math.abs(static_record?.increase * 100).toFixed(2)}%)
                            </Flex>
                        </Popover>
                    );
                },
                sorter: {
                    compare: (a, b) => {
                        const static_record_a = a?.items?.find(it => it?.title == statistic?.title)
                        const static_record_b = b?.items?.find(it => it?.title == statistic?.title)
                        return static_record_a?.value - static_record_b?.value
                    },
                    mutiple: 3,
                },
            }
        })
        return [...initial, ...list]
    }, [data, optionsStore, optionSmes])

    return (
        <Flex vertical gap={20}>
            <Flex justify="space-between" align="center">
                <Text className="title-card" strong>
                    Số liệu chi tiết
                </Text>
            </Flex>
            <Spin spinning={loading} >
                {data?.report_stores_statics?.length ? (
                    <Table
                        className="setting-table ant-upbase"
                        dataSource={data?.report_stores_statics?.filter(item => !!item?.smeId)}
                        columns={columns}
                        bordered
                        loading={loading}
                        pagination={false}
                        summary={() => {
                            if (!data?.report_stores_statics?.length) return <></>
                            const totalSmes = data?.report_stores_statics ? new Set(data?.report_stores_statics?.map((item) => item.smeId)).size : 0;
                            return (
                                <Table.Summary fixed="bottom">
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} align="left">{`Tổng (${data?.report_stores_statics?.length} gian hàng)`}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="left">{`${totalSmes} UpS`}</Table.Summary.Cell>
                                        {data.report_stores_statics?.find(store => store?.smeId == 0)?.items.map((item, idx) => {
                                            return (
                                                <Table.Summary.Cell key={item.title} index={idx + 2} align="right">
                                                    <Popover
                                                        placement="topRight"
                                                        content={<span>{formatNumberToCurrency(item?.value)}</span>}
                                                    >
                                                        {formatToBMK(item?.value)}
                                                    </Popover>
                                                </Table.Summary.Cell>
                                            );
                                        })}

                                    </Table.Summary.Row>
                                </Table.Summary>
                            );
                        }}
                        scroll={{ x: "max-content" }}
                        sticky={{ offsetHeader: 114 }}
                    />
                ) : (
                    <Empty className="empty-section" description="Chưa có dữ liệu" />
                )}
            </Spin>
        </Flex>
    );
};

export default memo(ReportTable);
