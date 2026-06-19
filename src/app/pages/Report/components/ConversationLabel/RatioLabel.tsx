import { Card, Col, Empty, Flex, Row, Typography } from "antd";
import React, { memo, useCallback, useMemo } from "react";
import { Pie, PieConfig } from '@ant-design/plots';
import { useReportContext } from "app/contexts/ReportContext";
import { useQuery } from "@apollo/client";
import query_chatReportLabelBar from "graphql/queries/query_chatReportLabelBar";
import { generateDateDefault } from '../../ReportHelper';

const { Text } = Typography;

const RatioLabel = () => {
    const { variablesQuery } = useReportContext();

    const { loading, data } = useQuery(query_chatReportLabelBar, {
        variables: {
            ...generateDateDefault(13, true),
            ...variablesQuery
        },
        fetchPolicy: 'cache-and-network',
    });

    const generateConfigChart: (chart) => PieConfig = useCallback((chart) => {
        const dataChart = chart?.data?.map(item => {
            return {
                type: item?.label,
                value: item?.value
            }
        })?.filter(item => item?.value > 0)

        return {
            data: dataChart,
            scale: { color: { range: chart?.data?.map(item => item?.color) } },
            height: 300,
            angleField: 'value',
            colorField: 'type',
            paddingRight: 80,
            animate: false,
            innerRadius: 0.6,
            label: {
                text: 'value',
                style: {
                    fontWeight: 'bold',
                },
            },
            tooltip: (d) => ({
                name: `${d.type}`,
                value: d.value
            }),
            viewStyle: {
                textAlign: 'center'
            },
            legend: {
                color: {
                    position: 'top',
                    layout: {
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                    },
                },
            },
            annotations: [
                {
                    type: 'text',
                    style: {
                        text: String(chart?.total) || '0',
                        x: '50%',
                        y: '50%',
                        textAlign: 'center',
                        fontSize: 30,
                        fontStyle: 'bold',
                    },
                },
            ],
        }
    }, [data]);

    return (
        <Card loading={loading}>
            <Flex vertical gap={20}>
                <Text className="title-card" strong>Tỷ lệ gắn/ gỡ theo nhãn hội thoại</Text>
                <Row gutter={30}>
                    {data?.chatReportLabelBar?.map(item => {
                        return (
                            <Col span={12}>
                                {item?.total > 0 ? (
                                    <Flex vertical justify="center" align="center" gap={10}>
                                        <Pie {...generateConfigChart(item)} />
                                        <Text style={{ marginRight: 60 }} strong>{item?.title}</Text>
                                    </Flex>
                                ) : (
                                    <Flex justify="center">
                                        <Empty className="empty-section" description="Chưa có dữ liệu" />
                                    </Flex>
                                )}
                            </Col>
                        )
                    })}
                </Row>
            </Flex>
        </Card>
    )
};

export default memo(RatioLabel);