import React, { memo, useLayoutEffect, useMemo } from "react";
import { useLayoutContext } from "app/contexts/LayoutContext";
import { Button, Card, Col, Flex, Progress, Row, Tooltip, Typography } from "antd";
import classNames from "classnames";

const { Text } = Typography;

const SLAOverview = (props: { data: any }) => {
    const [sumInTime, sumOutTime] = useMemo(() => {
        if (!props?.data?.length) return [0, 0]
        let sumIn = 0
        let sumOut = 0
        props?.data?.forEach(_data => {
            sumIn += _data?.in_sla_6h + _data?.in_sla_6h_9h + _data?.in_sla_9h_12h + _data?.in_sla_over_12h + _data?.in_sla_over_1d_2d + _data?.in_sla_over_2d_3d + _data?.in_sla_over_3d
            sumOut += _data?.out_sla_6h + _data?.out_sla_6h_9h + _data?.out_sla_9h_12h + _data?.out_sla_over_12h + _data?.out_sla_over_1d_2d + _data?.out_sla_over_2d_3d + _data?.out_sla_over_3d
        })
        return [sumIn, sumOut]
    }, [props?.data])

    return <>
        <Row gutter={20}>
            <Col span={12}>
                <Card style={{ borderColor: '#faad14' }}>
                    <Flex vertical align='center'>
                        <Text strong>Đơn đang xử lý trong hạn</Text>
                        <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{sumInTime}</Text>
                    </Flex>
                </Card>
            </Col>
            <Col span={12}>
                <Card style={{ borderColor: '#ff4d4f' }}>
                    <Flex>
                        <Flex vertical align='center' style={{ width: '100%' }} >
                            <Text strong>Đơn đang xử lý trễ hạn</Text>
                            <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{sumOutTime}</Text>
                        </Flex>
                    </Flex>
                </Card>
            </Col>
        </Row>
    </>
};

export default SLAOverview;