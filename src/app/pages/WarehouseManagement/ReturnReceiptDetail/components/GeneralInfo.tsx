import { Card, Col, Dropdown, Flex, Input, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import _ from "lodash";
import React, { useMemo } from "react";
import { OPTION_STATUS } from "../constants";
import { useQuery } from "@apollo/client";
import query_listReturnReceiptShippingCarriers from "graphql/queries/query_listReturnReceiptShippingCarriers";

const { Text } = Typography;

const GeneralInfo = ({ dataDetail }) => {
    const status = useMemo(() => {
        if (!dataDetail?.status) return '--'
        return OPTION_STATUS?.find(item => item?.value == dataDetail?.status)?.label
    }, [dataDetail])

    const {data: dataListShippingCarrier, loading: loadingDataListShippingCarrier} = useQuery(query_listReturnReceiptShippingCarriers, {
        fetchPolicy: 'cache-and-network'
    })
    const listShippingCarrier = useMemo(() => {
        if (!dataListShippingCarrier?.listReturnReceiptShippingCarriers?.data?.length) return []
        return dataListShippingCarrier?.listReturnReceiptShippingCarriers?.data?.map((carrier: {name: string, code: string}) => ({
            label: carrier?.name,
            value: carrier?.code
        }))
    }, [dataListShippingCarrier])

    const shipCarrier = useMemo(() => {
        return listShippingCarrier?.find(opt => opt?.value == dataDetail?.shippingCarrier) || {label: dataDetail?.shippingCarrier}
    }, [listShippingCarrier, dataDetail])
    return (
        <Card className="card-switch" title={false} style={{ marginBottom: 10 }}>
            <Row>
                <Col span={12}>
                    <Flex vertical gap={10}>
                        <Text>Mã phiếu hoàn trả: {dataDetail?.code}</Text>
                        <Text>Số lượng kiện hàng: {dataDetail?.totalItems}</Text>
                    </Flex>
                </Col>
                <Col span={12}>
                    <Flex vertical gap={10}>
                        <Text>Trạng thái: {status}</Text>
                        <Text>Đơn vị vận chuyển: <Text strong>{shipCarrier?.label}</Text></Text>
                    </Flex>
                </Col>
            </Row>
        </Card>
    );
};

export default GeneralInfo;
