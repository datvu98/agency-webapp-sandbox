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

const PrintStatusInfo = ({ data }) => {
	return (
		<Card title="Trạng thái in" size="small">
			<Row style={{ marginBottom: 10 }}>
				<Col span={12}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Phiếu nhặt hàng</Text>
						<Text>{"--"}</Text>
					</Flex>
				</Col>
				<Col span={12}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Phiếu xuất kho</Text>
						{/* <Text>{currentPIC?.label || "--"}</Text> */}
						<Text>{"--"}</Text>
					</Flex>
				</Col>
			</Row>
			<Row>
				<Col span={12}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Phiếu vận đơn</Text>
						{/* <Text>{currentPIC?.label || "--"}</Text> */}
						<Text>{"--"}</Text>
					</Flex>
				</Col>
			</Row>
		</Card>
	);
};

export default PrintStatusInfo;
