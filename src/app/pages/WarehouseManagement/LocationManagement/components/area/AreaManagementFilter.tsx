import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Input, Row } from "antd";
import _ from "lodash";
import queryString from "querystring";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AreaManagementFilter = ({ setShowAdd }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = new URLSearchParams(location.search);
	const queryParams = Object.fromEntries(params.entries());
	const [searchText, setSearchText] = useState(params.get("q") || "");

	useEffect(() => {
		setSearchText(params.get("q") || "");
	}, [params.get("warehouse"), params.get("q")]);
	return (
		<>
			<Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
				<Col span={6}>
					<Input
						placeholder="Tìm kiếm khu vực"
						value={searchText}
						prefix={<SearchOutlined />}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSearchText(e.target.value);
						}}
						onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
							navigate(
								`${location.pathname}?${queryString.stringify({
									...queryParams,
									page: 1,
									q: e.target.value,
								})}`
							);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const target = e.target as HTMLInputElement;
								navigate(
									`${location.pathname}?${queryString.stringify({
										...queryParams,
										page: 1,
										q: target.value,
									})}`
								);
							}
						}}
						suffix={<i className="flaticon2-search-1 icon-md ml-6" />}
					/>
				</Col>
				<Col span={18}>
					<Flex justify="end">
						<Button
							type="primary"
							className="btn-base"
							onClick={(e) => {
								e.preventDefault();
								setShowAdd("area");
							}}
						>
							Thêm mới
						</Button>
					</Flex>
				</Col>
			</Row>
		</>
	);
};

export default AreaManagementFilter;
