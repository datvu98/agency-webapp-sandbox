import React, { useMemo } from "react";
import { Card, Col, Flex, Row, Spin, Typography } from "antd";
import { formatNumberToCurrency } from "utils/helper";
import { CheckCircleTwoTone, HourglassTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import queryString from 'querystring'
import { useQuery } from '@apollo/client';
import { useSettlementContext } from "app/contexts/SettlementContext";
import query_summarySettlementOrder from "graphql/queries/query_summarySettlementOrder";


const { Text } = Typography;

const SettlementOverview = (props: { data: any, dataSummary: any, loadingSummary }) => {
    const params = queryString.parse(location.search.slice(1, 100000)) as any;

    const { sum_abnormal, sum_pending, sum_processed_month, sum_processed_week, total_order_abnormal } = props?.dataSummary?.summarySettlementOrder ?? {}

    return <Spin spinning={props?.loadingSummary}>
        <Row gutter={60}>
            <Col span={8} style={{ borderRight: '1px solid #888' }}>
                <Flex align='center'>
                    <Text strong>Chờ quyết toán</Text>
                    <span style={{ marginLeft: 4, marginBottom: -3 }}><HourglassTwoTone twoToneColor={'#ff5629'} />
                    </span>
                </Flex>
                <Flex align='center' justify="space-between">
                    <Text style={{ fontSize: 12 }}>Tổng cộng</Text>
                    <Text strong style={{ fontSize: '20px' }}>{formatNumberToCurrency(sum_pending)}đ</Text>
                </Flex>
            </Col>
            <Col span={8} style={{ borderRight: '1px solid #888' }}>
                <Flex align='center'>
                    <Text strong>Đã quyết toán</Text>
                    <span style={{ marginLeft: 4, marginBottom: -3 }}><CheckCircleTwoTone />
                    </span>
                </Flex>
                <Flex align='center' justify="space-between">
                    <Text style={{ fontSize: 12 }}>Tháng này</Text>
                    <Text strong style={{ fontSize: '20px' }}>{formatNumberToCurrency(sum_processed_month)}đ</Text>
                </Flex>
            </Col>
            <Col span={8} >
                <Flex align='center'>
                    <Text strong>Bất thường</Text>
                    <span style={{ marginLeft: 4, marginBottom: -3 }}><MinusCircleTwoTone twoToneColor={'red'} />
                    </span>
                </Flex>
                <Flex align='center' justify="space-between">
                    <Text style={{ fontSize: 12 }}>Tổng tiền lệch</Text>
                    <Text strong style={{ fontSize: '20px' }}>{formatNumberToCurrency(sum_abnormal)}đ</Text>
                </Flex>
            </Col>
        </Row>
    </Spin>
};

export default SettlementOverview;