import _, { omit } from "lodash";
import queryString from "querystring";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import { Button, Col, Input, Row, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { OPTIONS_STATUS } from "../../constants";

const AisleManagementFilter = ({ setShowAdd, optionsWarehouse, setShowAddFile }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = new URLSearchParams(location.search);
	const queryParams = Object.fromEntries(params.entries());
	const [searchText, setSearchText] = useState(params.get("q") || "");
	const [priority, setPriority] = useState(params.get("priority") || "");
	const warehouseId = useMemo(() => {
		if (!params.get("warehouse")) return optionsWarehouse?.[0]?.value;
		return Number(params.get("warehouse"));
	}, [params.get("warehouse"), optionsWarehouse]);
	const { data: dataArea, loading: loadingDataArea } = useQuery(query_locationManagerList, {
		variables: {
			warehouseId,
			type: "area",
		},
		fetchPolicy: "cache-and-network",
	});
	useEffect(() => {
		setSearchText(params.get("q") || "");
		setPriority(params.get("priority") || "");
	}, [params.get("warehouse"), params.get("q"), params.get("priority")]);
	const optionArea = useMemo(() => {
		if (!dataArea?.locationManagerList?.data?.length) return [];
		return dataArea?.locationManagerList?.data?.map((item) => ({
			label: item?.code,
			value: item?.id,
		}));
	}, [dataArea]);
	const handleNavigate = (newParams) => {
		navigate(
			`${location.pathname}?${queryString.stringify({
				...params,
				...newParams,
			})}`
		);
	};
	return (
		<>
			<Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
				<Col span={6}>
					<Input
						placeholder="Tìm kiếm luống đi"
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
					<Input
						placeholder={"Mức độ ưu tiên"}
						prefix={<SearchOutlined />}
						type="number"
						value={priority}
						onChange={(e) => setPriority(e.target.value)}
						onBlur={(e) => handleNavigate({ ...queryParams, page: 1, priority: e.target.value || undefined })}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const target = e.target as HTMLInputElement;
								navigate(
									`${location.pathname}?${queryString.stringify({
										...queryParams,
										page: 1,
										priority: target.value,
									})}`
								);
							}
						}}
					/>
				</Col>

				<Col span={6}>
					<Select
						placeholder={"Chọn khu vực"}
						allowClear
						mode="multiple"
						className="w-100"
						value={
							params.get("area")
								? params
										.get("area")
										?.split(",")
										.map((id) => Number(id))
								: undefined
						}
						options={optionArea}
						onChange={(values) => {
							if (!values?.length) {
								handleNavigate(omit(queryParams, ["area"]));
							} else {
								handleNavigate({
									...queryParams,
									page: 1,
									area: values.join(","),
								});
							}
						}}
						optionFilterProp="label"
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
			</Row>

			<Row justify="end" style={{ marginBottom: 16 }}>
				<Col>
					<Space>
						<Button
							type="default"
							className="btn-base color-base"
							onClick={(e) => {
								e.preventDefault();
								setShowAddFile("aisle");
							}}
						>
							Thêm theo file
						</Button>
						<Button
							type="primary"
							className="btn-base"
							onClick={(e) => {
								e.preventDefault();
								setShowAdd("aisle");
							}}
						>
							Thêm mới
						</Button>
					</Space>
				</Col>
			</Row>
		</>
	);
};

export default AisleManagementFilter;
