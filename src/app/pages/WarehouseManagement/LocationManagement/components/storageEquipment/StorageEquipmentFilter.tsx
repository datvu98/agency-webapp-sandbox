import _, { omit } from "lodash";
import queryString from "querystring";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import { Button, Col, Flex, Input, Row, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { OPTIONS_STATUS, OPTIONS_TYPE_EQUIPMENT } from "../../constants";

const StorageEquipmentFilter = ({ setShowAdd, optionsWarehouse, setShowAddFile }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = new URLSearchParams(location.search);
	const queryParams = Object.fromEntries(params.entries());
	const [searchText, setSearchText] = useState(params.get("q") || "");
	const warehouseId = useMemo(() => {
		if (!params.get("warehouse")) return optionsWarehouse?.[0]?.value;
		return Number(params.get("warehouse"));
	}, [params.get("warehouse"), optionsWarehouse]);
	const handleNavigate = (newParams) => {
		navigate(
			`${location.pathname}?${queryString.stringify({
				...params,
				...newParams,
			})}`
		);
	};
	useEffect(() => {
		setSearchText(queryParams?.q || "");
	}, [queryParams?.q, queryParams?.warehouse]);
	return (
		<>
			<Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
				<Col span={6}>
					<Input
						placeholder="Tìm kiếm thiết bị"
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

				<Col span={6}>
					<Select
						placeholder={"Loại thiết bị"}
						allowClear
						className="w-100"
						value={params.get("containerType") ? OPTIONS_TYPE_EQUIPMENT.find((item) => item?.value == params.get("containerType")) : undefined}
						options={OPTIONS_TYPE_EQUIPMENT}
						onChange={(value) => {
							if (!value) {
								handleNavigate(omit(queryParams, ["containerType"]));
							} else {
								handleNavigate({ ...queryParams, page: 1, containerType: value });
							}
						}}
					/>
				</Col>
				<Col span={6}>
					<Select
						placeholder={"Chọn trạng thái"}
						allowClear
						className="w-100"
						value={params.get("isActive") ? OPTIONS_STATUS.find((item) => item?.value == Number(params.get("isActive"))) : undefined}
						options={OPTIONS_STATUS}
						onChange={(value) => {
							if (!value) {
								handleNavigate(omit(queryParams, ["isActive"]));
							} else {
								handleNavigate({ ...queryParams, page: 1, isActive: value });
							}
						}}
					/>
				</Col>
				<Col span={6}>
					<Flex justify="end" gap={10}>
						<Button
							type="default"
							className="btn-base color-base"
							onClick={(e) => {
								e.preventDefault();
								setShowAddFile("storage");
							}}
						>
							Thêm theo file
						</Button>
						<Button
							type="primary"
							className="btn-base"
							onClick={(e) => {
								e.preventDefault();
								setShowAdd("storage");
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

export default StorageEquipmentFilter;
