import { DownOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Flex, Input, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showAlert } from "utils/helper";
const { Text } = Typography;

const GeneralInfo = ({ dataDetail, dataPagination }) => {
	const totalPackage = useMemo(() => {
		if (dataDetail?.processingList?.type == 'MIO') return 1
		return dataPagination?.totalItems
	}, [dataDetail])
	return (
		<Card className="card-switch" title={false} style={{ marginBottom: 10 }}>
			<Flex align="center" gap={10}>
				<Text strong>Số lượng kiện cần đóng:</Text>
				<Text strong style={{ color: "#d48e5b" }}>
					{totalPackage} kiện
				</Text>
			</Flex>
			<Flex align="center" gap={10}>
				<Text>Thiết bị chứa hàng:</Text>
				<Text style={{ color: "#67a678" }}>{dataDetail?.storageEquipment?.code}</Text>
			</Flex>
			<Flex align="center" gap={10}>
				<Text>Danh sách xử lý:</Text>
				<Text>{dataDetail?.processingList?.code}</Text>
			</Flex>
		</Card>
	);
};

export default GeneralInfo;
