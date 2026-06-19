import React, { memo, useLayoutEffect, useMemo } from "react";
import { useLayoutContext } from "app/contexts/LayoutContext";
import { Button, Card, Col, Flex, Progress, Row, Spin, Tooltip, Typography } from "antd";
import classNames from "classnames";
import { useQuery } from "@apollo/client";
import query_report_fullfillmentOverview from "graphql/queries/query_report_fullfillmentOverview";
import { formatNumberToCurrency } from "utils/helper";

const { Text } = Typography;

const SLAPieChart = (props: { variables: any }) => {
    const { data, loading } = useQuery(query_report_fullfillmentOverview, {
        variables: props?.variables,
        fetchPolicy: 'no-cache',
    })
    const dataTable = useMemo(() => {
        if (!data?.report_fullfillmentOverview) return {}
        return data?.report_fullfillmentOverview
    }, [data?.report_fullfillmentOverview])
    return <Spin spinning={loading}>
        <Row gutter={20}>
            <Col span={6}>
                <Flex align='center' justify="center">
                    <Text strong style={{ marginRight: 20 }}>SLA</Text>
                    <Progress type="circle" percent={dataTable?.totalProcessedShipped != 0 ? Math.round(dataTable?.totalProcessedSuccess / dataTable?.totalProcessedShipped * 100) : 0} size={80} strokeColor='#52c41a' strokeWidth={10} />
                </Flex>
            </Col>
            <Col span={6}>
                <Flex>
                    <Flex vertical align='center' style={{ width: '100%' }} >
                        <Text strong>Tỷ lệ đơn đạt SLA</Text>
                        <Text strong style={{ fontSize: '20px', marginTop: 10, color: '#52c41a' }}>{dataTable?.totalProcessedShipped != 0 ? Math.round(dataTable?.totalProcessedSuccess / dataTable?.totalProcessedShipped * 100) : 0} %</Text>
                    </Flex>
                </Flex>
            </Col>
            <Col span={6}>
                <Flex>
                    <Flex vertical align='center' style={{ width: '100%' }} >
                        <Text strong>Tỷ lệ đơn không đạt SLA</Text>
                        <Text strong style={{ fontSize: '20px', marginTop: 10, color: '#ff4d4f' }}>{dataTable?.totalProcessedShipped != 0 ? Math.round(dataTable?.totalProcessedFail / dataTable?.totalProcessedShipped * 100) : 0} %</Text>
                    </Flex>
                </Flex>
            </Col>
            <Col span={6}>
                <Flex>
                    <Flex vertical align='center' style={{ width: '100%' }} >
                        <Text strong>Tổng số đơn hủy do vi phạm SLA</Text>
                        <Text strong style={{ fontSize: '20px', marginTop: 10, color: '#ff4d4f' }}>{dataTable?.totalCancelBySla || 0}</Text>
                    </Flex>
                </Flex>
            </Col>
        </Row>
    </Spin>
};

export default SLAPieChart;