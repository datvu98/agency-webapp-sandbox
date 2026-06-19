import { Card, Col, Flex, Row, Typography } from "antd";
import React from "react";
import { formatNumberToCurrency } from "utils/helper";

const { Text } = Typography;

const GHNSLAOverview = ({ data }) => {
    return <>
        <Row gutter={20}>
            <Col span={12}>
                <Card style={{ borderColor: '#41E432' }}>
                    <Flex vertical align='center'>
                        <Text strong>Đơn giao hàng nhanh</Text>
                        <Text strong style={{ fontSize: '20px', marginTop: 10, color: "#41E432" }}>{formatNumberToCurrency(data?.total_fast_order || 0)}</Text>
                        <Text strong style={{ fontSize: '16px', marginTop: 10, color: "#41E432" }}>{data?.fast_delivery_rate || 0}%</Text>
                    </Flex>
                </Card>
            </Col>
            <Col span={12}>
                <Card style={{ borderColor: '#ff4d4f' }}>
                    <Flex>
                        <Flex vertical align='center' style={{ width: '100%' }} >
                            <Text strong>Đơn chưa giao hàng đúng hạn</Text>
                            <Text strong style={{ fontSize: '20px', marginTop: 10, color: "#ff4d4f" }}>{formatNumberToCurrency(data?.total_fast_order_pending || 0)}</Text>
                            <Text strong style={{ fontSize: '16px', marginTop: 10, color: "#ff4d4f" }}>{data?.delivery_pending_rate || 0}%</Text>
                        </Flex>
                    </Flex>
                </Card>
            </Col>
        </Row>
    </>
};

export default GHNSLAOverview;