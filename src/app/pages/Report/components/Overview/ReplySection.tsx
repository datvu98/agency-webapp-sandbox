import { Button, Card, Empty, Flex, Tooltip, Typography } from "antd";
import React, { memo, useMemo } from "react";
import { Gauge, GaugeConfig } from '@ant-design/plots';
import { useReportContext } from "app/contexts/ReportContext";
import { useQuery } from "@apollo/client";
import query_chatReportOverviewIndex from "graphql/queries/query_chatReportOverviewIndex";
import { generateDateDefault } from '../../ReportHelper';
import query_chatReportOverviewRateOnTimeReponses from "graphql/queries/query_chatReportOverviewRateOnTimeReponses";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ReplySection = () => {
    const { variablesQuery } = useReportContext();

    const { loading, data } = useQuery(query_chatReportOverviewRateOnTimeReponses, {
        variables: {
            ...generateDateDefault(),
            ...variablesQuery
        },
        fetchPolicy: 'cache-and-network',
    });

    const config: GaugeConfig = useMemo(() => {
        const rate = !!data?.chatReportOverviewRateOnTimeReponses
            ? (data?.chatReportOverviewRateOnTimeReponses * 100).toFixed(2) : 0;

        return {
            height: 263,
            paddingBottom: -125,
            animate: true,
            autoFit: true,
            data: {
                target: rate,
                total: 100,
                name: 'score',
                thresholds: [0, 20, 40, 60, 80, 100],
            },
            legend: false,
            scale: {
                color: {
                    range: ['red', 'red', 'red', 'red', '#ff5629', 'green'],
                },
            },
            theme: {
                padding: 'auto',
                inset: 'auto'
            },
            interaction: {
                tooltip: false
            },
            style: {
                padding: 0,
                color: '#1890ff',
                textContent: target => `${target}%`,
            },
        }
    }, [data]);

    return (
        <Card loading={loading}>
            <div id="textContainer"></div>
            <Flex align="center" vertical gap={20}>
                <Flex gap={4}>
                    <Text className="title-card" strong>Tỷ lệ phản hồi đúng hạn</Text>
                    <Tooltip
                        title="Tỷ lệ phản hồi đúng hạn của ngày cuối cùng trong khoảng lọc"
                        placement="bottom"
                    >
                        <InfoCircleOutlined />
                    </Tooltip>
                </Flex>
                {typeof data?.chatReportOverviewRateOnTimeReponses == 'number' ? (
                    <Gauge {...config} />
                ) : (
                    <Empty
                        className="empty-section"
                        description="Chưa có dữ liệu"
                    />
                )}
            </Flex>
        </Card>
    )
};

export default memo(ReplySection);