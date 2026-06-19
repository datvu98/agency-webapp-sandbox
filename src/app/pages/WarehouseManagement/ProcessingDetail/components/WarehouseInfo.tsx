import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Tag } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { showAlert } from "utils/helper";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import queryString from "querystring";
import dayjs from "dayjs";
import { OPTIONS_TYPE_PICKUP } from "../../ProcessingList/constants";

const { Text, Paragraph } = Typography;

const WarehouseInfo = ({ data, optionPIC, optionsWarehouse }) => {
	const currentWh = useMemo(() => {
		return optionsWarehouse?.find((option) => option?.value == data?.processingListGetById?.data?.warehouseId);
	}, [data, optionsWarehouse]);
	const currentPIC = useMemo(() => {
		return optionPIC?.find((option) => option?.value == data?.processingListGetById?.data?.picId);
	}, [data, optionPIC]);
	return (
		<Card title="Thông tin kho" size="small">
			<Row style={{ marginBottom: 10 }}>
				<Col span={12}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Kho xử lý</Text>
						<Text>{currentWh?.label || "--"}</Text>
					</Flex>
				</Col>
				<Col span={12}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Phân công</Text>
						<Text>{currentPIC?.label || "--"}</Text>
					</Flex>
				</Col>
			</Row>
			<Row>
				<Col span={24}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Ghi chú</Text>
						<Tooltip title={data?.processingListGetById?.data?.note} placement="bottom">
							<Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
								{data?.processingListGetById?.data?.note || "--"}
							</Paragraph>
						</Tooltip>
					</Flex>
				</Col>
			</Row>
		</Card>
	);
};

export default WarehouseInfo;
