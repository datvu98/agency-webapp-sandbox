import { Card, Flex, Typography } from "antd";
import React, { memo, useMemo } from "react";
import { Column, ColumnConfig } from '@ant-design/plots';
import { useQuery } from "@apollo/client";
import { generateDateDefault, generateDateRange } from '../../ReportHelper';
import { useReportContext } from "app/contexts/ReportContext";
import query_chatReportLabelColumn from "graphql/queries/query_chatReportLabelColumn";

const { Text } = Typography;

const ChartLabel = () => {
    const { variablesQuery } = useReportContext();

    const variables = useMemo(() => {
        return {
            ...generateDateDefault(13, true),
            ...variablesQuery
        }
    }, [variablesQuery]);

    const { loading, data } = useQuery(query_chatReportLabelColumn, {
        variables,
        fetchPolicy: 'cache-and-network',
    });

    const dataChart = useMemo(() => {
        const categoryChartLabel = generateDateRange(variables.from, variables.to, variables?.type || 'day');
        const [maxAttachment, maxDetachment] = [
            Math.max(...(data?.chatReportLabelColumn?.map(item => item?.value) || [])),
            Math.max(...(data?.chatReportLabelColumn?.map(item => item?.value2) || [])),
        ];

        return categoryChartLabel?.date?.flatMap((date, index) => {
            const findedChart = data?.chatReportLabelColumn?.find(item => item?.time == date);

            const chartAttachment = [{
                time: categoryChartLabel?.range?.[index] || date,
                percent: findedChart
                    ? (maxAttachment > 0 ? ((findedChart?.value / maxAttachment) * 100).toFixed(2) : 0)
                    : 0,
                value: findedChart?.value || 0,
                type: 'Lượt gán'
            }];

            const chartDetachment = [{
                time: categoryChartLabel?.range?.[index] || date,
                percent: findedChart
                    ? (maxAttachment > 0 ? ((findedChart?.value2 / maxDetachment) * 100).toFixed(2) : 0)
                    : 0,
                value: findedChart?.value2 || 0,
                type: 'Lượt gỡ'
            }];

            return [...chartAttachment, ...chartDetachment]
        })
    }, [variables, data]);

    const config: ColumnConfig = useMemo(() => {
        return {
            data: dataChart,
            height: 400,
            xField: 'time',
            yField: 'value',
            colorField: 'type',
            group: true,
            legend: {
                color: {
                    position: 'bottom',
                    layout: {
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                    },
                },
            },
            axis: {
                x: {
                    line: true,
                    lineStroke: '#6c757d',
                    label: true,
                    // labelFontSize: 15,
                    // size: 15,
                    // labelAlign: 'perpendicular',
                    // labelDirection: 'negative',                    
                    // transform: [{
                    //     type: 'rotate',
                    //     optionalAngles: [30, 0, 30],
                    //     recoverWhenFailed: true
                    // }],
                },
                y: {
                    line: true,
                    lineStroke: '#6c757d'
                },
            },
            scale: {
                color: { range: ['#019ef7', '#15c2c2'] },
            },
            style: {
                inset: 0,
            },
        }
    }, [dataChart]);

    return (
        <Card loading={loading}>
            <Flex vertical gap={20}>
                <Text className="title-card" strong>Biểu đồ gắn/gỡ theo nhãn hội thoại</Text>
                <Column {...config} />
            </Flex>
        </Card>
    )
};

export default memo(ChartLabel);