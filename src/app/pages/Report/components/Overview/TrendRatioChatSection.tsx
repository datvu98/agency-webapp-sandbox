import { Card, Divider, Empty, Flex, Tooltip, Typography } from "antd";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Line, LineConfig } from '@ant-design/plots';
import { useReportContext } from "app/contexts/ReportContext";
import { generateDateDefault, generateDateRange } from '../../ReportHelper';
import { useQuery } from "@apollo/client";
import query_chatReportOverviewRateResponseTrend from "graphql/queries/query_chatReportOverviewRateResponseTrend";
import randomColor from 'randomcolor';
import { COLOR_LAZADA, COLOR_SHOPEE } from "../../ReportConstants";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const TrendRatioChatSection = () => {
    const { variablesQuery, optionsStore } = useReportContext();

    const variables = useMemo(() => {
        return {
            ...generateDateDefault(),
            ...variablesQuery
        }
    }, [variablesQuery]);

    const { loading, data } = useQuery(query_chatReportOverviewRateResponseTrend, {
        variables,
        fetchPolicy: 'cache-and-network',
    });

    const dataChart = useMemo(() => {
        const categoryChartLabel = generateDateRange(variables.from, variables.to, variables?.type == 'hours' ? 'day' : (variables?.type || 'day'));

        return data?.chatReportOverviewRateResponseTrend?.flatMap(item => {
            return categoryChartLabel?.date?.map((date, index) => {
                const findedChart = item?.data?.find(_item => _item?.time == date);

                return {
                    time: categoryChartLabel?.range?.[index] || date,
                    value: findedChart ? (findedChart?.value * 100).toFixed(2) : '0.00',
                    type: item?.title
                }
            })
        })
    }, [variables, data?.chatReportOverviewRateResponseTrend]);

    const colorsChart = useMemo(() => {
        return data?.chatReportOverviewRateResponseTrend?.map((item, index) => {
            const storeChart = optionsStore?.find(store => store?.label == item?.title);
            const channelCode = storeChart?.channel?.code;

            if (channelCode == 'shopee') {
                return COLOR_SHOPEE[index]
            }

            if (channelCode == 'lazada') {
                return COLOR_LAZADA[index]
            }
        })
    }, [data?.chatReportOverviewRateResponseTrend, optionsStore]);

    const config: LineConfig = {
        data: dataChart,
        xField: 'time',
        yField: 'value',
        colorField: 'type',
        axis: {
            y: {
                line: {
                    stroke: 'red',
                    lineWidth: 4
                },
                labelFormatter: (v) => `${v}%`,
                rotate: 90,
                label: {
                    style: { fill: 'red' }
                }
                // label: {
                // }
            },
        },
        tooltip: (d) => {
            return {
                title: 'time',
                value: `${d?.value || 0}%`,
            }
        },
        point: {
            sizeField: 5, // Kích thước của điểm
            shapeField: 'circle', // Hình dạng của điểm
            style: {
                fill: '#019ef7', // Màu fill của điểm
                stroke: '#019ef7', // Màu đường viền của điểm
                lineWidth: 2, // Độ dày của đường viền của điểm
            },
        },
        annotations: [
            {
                text: 'Custom Annotation Legend',
                type: "lineY",
                yField: 80,
                style: {
                    stroke: "#F4664A",
                    strokeOpacity: 1,
                    lineWidth: 2,
                    lineDash: [4, 4],
                },
            },
        ],
        legend: {
            color: {
                position: 'top',
                layout: {
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    flexDirection: 'column',
                },
            },
        },
        scale: {
            color: { range: colorsChart },
            y: {
                domain: [0, 100],
            }
        },
        style: {
            lineWidth: 2,
        },
    };

    return (
        <Card loading={loading}>
            <Flex justify="space-between">
                <Flex gap={4}>
                    <Text className="title-card" strong>Xu hướng của tỷ lệ phản hồi chat đúng hạn</Text>
                    <Tooltip
                        title="Tỷ lệ phản hồi đúng hạn = (Tổng lượt phản hồi đúng hạn trong vòng 7 ngày gần nhất/ Tổng lượt chat trong vòng 7 ngày gần nhất)"
                        placement="bottom"
                    >
                        <InfoCircleOutlined />
                    </Tooltip>
                </Flex>
                {data?.chatReportOverviewRateResponseTrend?.length > 0 && <Flex style={{ marginRight: 18, position: 'relative', top: 18 }} align="center" gap={10}>
                    <div style={{ border: '2px dashed red', width: 40 }} />
                    <Text style={{ fontSize: 12, fontWeight: 500 }}>Chỉ tiêu</Text>
                </Flex>}
            </Flex>
            {data?.chatReportOverviewRateResponseTrend?.length > 0 ? (
                <Line {...config} />
            ) : (
                <Empty className="empty-section" description="Chưa có dữ liệu" />
            )}
        </Card>
    )
};

export default memo(TrendRatioChatSection);