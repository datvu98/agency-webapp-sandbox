import { Card, Col, Dropdown, Flex, Input, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import _ from "lodash";
import React, { useMemo } from "react";
import { OPTION_STATUS } from "../constants";
const { Text } = Typography;

const GeneralInfo = ({ dataDetail }) => {
	const status = useMemo(() => {
		if (!dataDetail?.status) return '--'
		return OPTION_STATUS?.find(item => item?.value == dataDetail?.status)?.label
	}, [dataDetail])
	return (
		<Card className="card-switch" title={false} style={{ marginBottom: 10 }}>
			<Row>
				<Col span={12}>
					<Flex vertical gap={10}>
						<Text>Mã phiên giao: {dataDetail?.code}</Text>
						<Text>Số lượng kiện hàng: {dataDetail?.totalItems}</Text>
					</Flex>
				</Col>
				<Col span={12}>
					<Flex vertical gap={10}>
						<Text>Trạng thái: {status}</Text>
						<Text>Đơn vị vận chuyển: <Text strong>{dataDetail?.shippingCarrier}</Text></Text>
					</Flex>
				</Col>
			</Row>
		</Card>
	);
};

export default GeneralInfo;
