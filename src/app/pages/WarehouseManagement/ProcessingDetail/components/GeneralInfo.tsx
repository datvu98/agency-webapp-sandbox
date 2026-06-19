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

const { Text } = Typography;

const GeneralInfo = ({ data }) => {
	console.log(data)
	return (
		<Card title="Thông tin danh sách xử lý" size="small">
			<Row style={{ marginBottom: 10 }}>
				<Col span={12}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Số lượng phiếu xuất</Text>
						<Text>{data?.processingListGetById?.data?.totalItems}</Text>
					</Flex>
				</Col>
				<Col span={12}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Số lượng hàng hóa</Text>
						<Text>{data?.processingListGetById?.data?.totalRequestedQuantity}</Text>
					</Flex>
				</Col>
			</Row>
			<Row>
				<Col span={12}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Loại danh sách</Text>
						<Text>{OPTIONS_TYPE_PICKUP?.[data?.processingListGetById?.data?.type]}</Text>
					</Flex>
				</Col>
				<Col span={12}>
					<Flex vertical gap={4}>
						<Text style={{ color: "#919099", fontSize: 12 }}>Thời gian cập nhật</Text>
						<Text>{dayjs(data?.processingListGetById?.data?.updatedAt).format("HH:mm DD/MM/YYYY")}</Text>
					</Flex>
				</Col>
			</Row>
		</Card>
	);
};

export default GeneralInfo;
