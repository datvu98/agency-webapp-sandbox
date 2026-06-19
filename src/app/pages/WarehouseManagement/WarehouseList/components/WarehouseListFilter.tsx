import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchProps } from "antd/es/input";
import queryString from "querystring";

const { Text } = Typography;
const { Search } = Input;

const WarehouseListFilter = () => {
	const navigate = useNavigate();
	const location = useLocation()
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [searchText, setSearchText] = useState<string>(params?.q || "");

	const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
		navigate(
			`${location.pathname}?${queryString.stringify({
				...params,
				q: value,
			})}`.replaceAll("%2C", ",")
		);
	};
	return (
		<Row justify="space-between" style={{ marginBottom: 20 }}>
			<Col span={10}>
				<Search
					placeholder="Tìm kiếm kho"
					onSearch={onSearch}
					value={searchText}
					onChange={(e) => {
						setSearchText(e.target.value);
					}}
					onBlur={(e) => {
						navigate(
							`${location.pathname}?${queryString.stringify({
								...params,
								q: e.target.value,
							})}`.replaceAll("%2C", ",")
						);
					}}
				/>
			</Col>
			<Col span={14} style={{ display: "flex", justifyContent: "end" }}>
				<Button
					type="primary"
					className="btn-base"
					// loading={loading}
					onClick={() => {
						navigate(`${location.pathname}/create`);
					}}
				>
					Thêm kho
				</Button>
			</Col>
		</Row>
	);
};

export default WarehouseListFilter;
