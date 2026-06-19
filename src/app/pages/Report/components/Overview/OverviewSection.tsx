import { useQuery } from "@apollo/client";
import { Card, Col, Flex, Row, Typography } from "antd";
import { useReportContext } from "app/contexts/ReportContext";
import query_chatReportOverviewIndex from "graphql/queries/query_chatReportOverviewIndex";
import React, { memo } from "react";
import { generateAvgTimestamp, generateDateDefault } from '../../ReportHelper';

const { Text } = Typography;

const OverviewSection = () => {
    const { variablesQuery } = useReportContext();

    const { loading, data } = useQuery(query_chatReportOverviewIndex, {
        variables: {
            ...generateDateDefault(),
            ...variablesQuery
        },
        fetchPolicy: 'cache-and-network',
    });

    return (
        <Card loading={loading}>
            <Flex align="center" vertical gap={22}>
                <Text className="title-card" strong>Tổng quan</Text>
                <Row wrap gutter={[20, 10]}>
                    <Col span={12}>
                        <Flex vertical align="center" gap={4} style={{ background: "#eff2f5", borderRadius: 6, padding: '10px 0px' }}>
                            <Text type="danger">Tổng lượt phản hồi</Text>
                            <Text className="text-count">
                                {data?.chatReportOverviewIndex?.countResponses || 0}
                            </Text>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical align="center" gap={4} style={{ background: "#eff2f5", borderRadius: 6, padding: '10px 0px' }}>
                            <Text type="danger">Tổng lượt chat</Text>
                            <Text className="text-count">
                                {data?.chatReportOverviewIndex?.countChat || 0}
                            </Text>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical align="center" gap={4} style={{ background: "#eff2f5", borderRadius: 6, padding: '10px 0px' }}>
                            <Text type="danger">Lượt phản hồi quá hạn</Text>
                            <Text className="text-count">
                                {data?.chatReportOverviewIndex?.countExpiredResponses || 0}
                            </Text>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical align="center" gap={4} style={{ background: "#eff2f5", borderRadius: 6, padding: '10px 0px' }}>
                            <Text type="danger">Lượt chat quá hạn</Text>
                            <Text className="text-count">
                                {data?.chatReportOverviewIndex?.countExpiredChat || 0}
                            </Text>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical align="center" gap={4} style={{ background: "#eff2f5", borderRadius: 6, padding: '10px 0px' }}>
                            <Text type="danger">Tổng lượt PH đúng hạn</Text>
                            <Text className="text-count">
                                {data?.chatReportOverviewIndex?.countOnTimeResponses ? data?.chatReportOverviewIndex?.countOnTimeResponses : 0}
                            </Text>
                        </Flex>
                    </Col>
                    <Col span={12}>
                        <Flex vertical align="center" gap={4} style={{ background: "#eff2f5", borderRadius: 6, padding: '10px 0px' }}>
                            <Text type="danger">Thời gian phản hồi TB</Text>
                            <Text className="text-count">
                                {!!data?.chatReportOverviewIndex?.avgDuration ? generateAvgTimestamp(data?.chatReportOverviewIndex?.avgDuration) : 0}
                            </Text>
                        </Flex>
                    </Col>
                </Row>
            </Flex>
        </Card>
    )
};

export default memo(OverviewSection);