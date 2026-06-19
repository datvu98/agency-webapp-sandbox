import React, { memo, useLayoutEffect, useMemo } from "react";
import { useLayoutContext } from "app/contexts/LayoutContext";
import { Button, Card, Col, Flex, Progress, Row, Tooltip, Typography } from "antd";
import classNames from "classnames";

const { Text } = Typography;

const FullfillmentOverview = (props: { data: any }) => {
    const [total_to_provider_wms, total_package, total_tts_expired, total_pending, total_warehouse_error,
        total_platform_error, total_tts_expire_soon, total_cancel_by_tts_expired, total_to_self_wms, total_packed, total_to_smart_wms, total_express
    ] = useMemo(() => {
        let totalToProviderWms = 0
        let totalPackage = 0
        let totalTtsExpired = 0
        let totalPending = 0
        let totalWarehouseError = 0
        let totalPlatformError = 0
        let totalTtsExpireSoon = 0
        let totalCancelByTtsExpired = 0
        let totalToSelfWms = 0
        let totalPacked = 0
        let totalToSmartWms = 0
        let totalExpress = 0
        props?.data?.forEach(_data => {
            totalToProviderWms += _data?.total_to_provider_wms
            totalPackage += _data?.total_package
            totalTtsExpired += _data?.total_tts_expired
            totalPending += _data?.total_pending
            totalWarehouseError += _data?.total_warehouse_error
            totalPlatformError += _data?.total_platform_error
            totalTtsExpireSoon += _data?.total_tts_expire_soon
            totalCancelByTtsExpired += _data?.total_cancel_by_tts_expired
            totalToSelfWms += _data?.total_to_self_wms
            totalToSmartWms += _data?.total_to_smart_wms
            totalPacked += _data?.total_packed
            totalExpress += _data?.total_express
        })
        return [totalToProviderWms, totalPackage, totalTtsExpired, totalPending, totalWarehouseError, totalPlatformError,
            totalTtsExpireSoon, totalCancelByTtsExpired, totalToSelfWms, totalPacked, totalToSmartWms, totalExpress
        ]
    }, [props?.data])

    const percent = total_package != 0
        ? Number(((total_to_provider_wms + total_to_self_wms + total_to_smart_wms) / total_package * 100).toFixed(2))
        : 0;
    return <>
        <Row gutter={20} align="stretch">
            <Col span={6}>
                <Card style={{ borderColor: '#1890ff' }}>
                    <Flex vertical align="center">
                        <Flex vertical align='center'>
                            <Text strong>Đơn đã đẩy sang kho</Text>
                        </Flex>
                        <Flex vertical align="end" style={{ width: '100%', position: 'relative' }}>
                            <Text><span style={{ color: (total_to_provider_wms + total_to_self_wms + total_to_smart_wms) != total_package ? '#ff4d4f' : 'black' }}>{(total_to_provider_wms + total_to_self_wms + total_to_smart_wms)}</span>/{total_package}</Text>
                            <Progress percent={percent} showInfo={false} strokeWidth={20} strokeColor={percent !== 100 ? '#ff4d4f' : '#52c41a'} />
                            <div className={`progress-percent left`} style={{ color: 'black' }}>{percent}%</div>
                        </Flex>
                        <Text strong style={{ fontSize: '20px', }}>{total_to_provider_wms + total_to_self_wms + total_to_smart_wms}</Text>
                    </Flex>
                </Card>
            </Col>
            <Col span={6}>
                <Card style={{ borderColor: '#ff4d4f', height: '100%' }}>
                    <Flex >
                        <Flex vertical align='center' style={{ width: '100%' }} >
                            <Text strong>Đơn hàng lỗi kho</Text>
                            <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{total_warehouse_error}</Text>
                        </Flex>
                    </Flex>
                </Card>

            </Col>
            <Col span={6}>
                <Card style={{ borderColor: '#faad14', height: '100%' }}>
                    <Flex>
                        <Flex vertical align='center' style={{ width: '100%' }}>
                            <Text strong>Đơn hàng lỗi sàn</Text>
                            <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{total_platform_error}</Text>
                        </Flex>
                    </Flex>
                </Card>

            </Col>
            <Col span={6}>
                <Card style={{ borderColor: '#ff4d4f', height: '100%' }}>
                    <Flex>
                        <Flex vertical align='center' style={{ width: '100%' }} >
                            <Text strong>Đơn quá hạn</Text>
                            <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{total_tts_expired}</Text>
                        </Flex>
                    </Flex>
                </Card>

            </Col>
        </Row>
        <Row gutter={20} style={{ marginTop: '20px', justifyContent: 'center' }}>
            <Col span={6}>
                <Card style={{ borderColor: '#faad14' }}>
                    <Flex>
                        <Flex vertical align='center' style={{ width: '100%' }} >
                            <Text strong>Đơn sắp hết hạn</Text>
                            <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{total_tts_expire_soon}</Text>
                        </Flex>
                    </Flex>
                </Card>

            </Col>
            <Col span={6}>
                <Card style={{ borderColor: '#52c41a' }}>
                    <Flex>
                        <Flex vertical align='center' style={{ width: '100%' }}>
                            <Text strong>Đơn chờ đóng gói</Text>
                            <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{total_pending}</Text>
                        </Flex>
                    </Flex>
                </Card>

            </Col>
            <Col span={6}>
                <Card style={{ borderColor: '#52c41a' }}>
                    <Flex>
                        <Flex vertical align='center' style={{ width: '100%' }}>
                            <Text strong>Đơn chờ lấy hàng</Text>
                            <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{total_packed}</Text>
                        </Flex>
                    </Flex>
                </Card>

            </Col>
            <Col span={6}>
                <Card style={{ borderColor: '#ff4d4f' }}>
                    <Flex>
                        <Flex vertical align='center' style={{ width: '100%' }} >
                            <Text strong>Đơn hoả tốc</Text>
                            <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{total_express}</Text>
                        </Flex>
                    </Flex>
                </Card>
            </Col>

            {/* <Col span={12}>
                        <Card style={{ borderColor: '#ff4d4f' }}>
                            <Flex>
                                <Flex vertical align='center' style={{ width: '100%' }}>
                                    <Text strong>Đơn hủy do quá hạn</Text>
                                    <Text strong style={{ fontSize: '20px', marginTop: 10 }}>{total_cancel_by_tts_expired}</Text>
                                </Flex>
                            </Flex>
                        </Card>

                    </Col> */}
        </Row>
    </>
};

export default FullfillmentOverview;