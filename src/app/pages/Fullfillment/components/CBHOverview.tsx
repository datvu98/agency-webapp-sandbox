import { Card, Col, Flex, Row, Typography } from 'antd';
import React, { useMemo } from 'react'

const { Text } = Typography;
const CBHOverview = (props: { data: any }) => {
    const [sumInTime, sumOutTime] = useMemo(() => {
        if (!props?.data?.length) return [0, 0]
        let sumIn = 0
        let sumOut = 0
        props?.data?.forEach(_data => {
            sumIn += _data?.in_sla_1h30p + _data?.in_sla_1h30p_12h + _data?.in_sla_over_12h + _data?.in_sla_over_1d_2d + _data?.in_sla_over_2d
            sumOut += _data?.out_sla_1h30p + _data?.out_sla_1h30p_12h + _data?.out_sla_over_12h + _data?.out_sla_over_1d_2d + _data?.out_sla_over_2d
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
}

export default CBHOverview