import { Button, Col, Flex, Row, Typography, Select, Drawer } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "querystring";

const { Text } = Typography;

const ProcessingListFilterDrawer = ({ showDrawer, setShowDrawer, optionSmes, optionsWarehouse, optionPIC }) => {
	const navigate = useNavigate();
	const location = useLocation()
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [currentFilter, setCurrentFilter] = useState({
		warehouses: [],
		ups: [],
		createBy: [],
	});

	useEffect(() => {
		setCurrentFilter({
			warehouses: params?.warehouses ? params?.warehouses?.split(",")?.map((item) => Number(item)) : [],
			ups: params?.ups ? params?.ups?.split(",")?.map((item) => Number(item)) : [],
			createBy: params?.createBy ? params?.createBy?.split(",")?.map((item) => item) : [],
		});
	}, []);
	return (
		<>
			<Drawer
				title="Bộ lọc nâng cao"
				closable={false}
				// onClose={() => {
				// 	setShowDrawer(false);
				// }}
				size="large"
				open={showDrawer}
				footer={
					<Flex gap={10} justify="end">
						<Button
							className="btn-base"
							onClick={() => {
								setShowDrawer(false);
								setCurrentFilter({
									warehouses: [],
									ups: [],
									createBy: [],
								});
							}}
						>
							Huỷ
						</Button>
						<Button
							className="btn-base"
							type="primary"
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										warehouses: currentFilter?.warehouses?.join(","),
										ups: currentFilter?.ups?.join(","),
										createBy: currentFilter?.createBy?.join(","),
									})}`.replaceAll("%2C", ",")
								);
								setShowDrawer(false);
							}}
						>
							Áp dụng
						</Button>
					</Flex>
				}
			>
				<Row align={"middle"}>
					<Col span={4}>
						<Text style={{ width: "100%" }}>Kho vật lý:</Text>
					</Col>
					<Col span={20}>
						<Select
							style={{ width: "100%" }}
							placeholder="Chọn kho vật lý"
							showSearch
							optionFilterProp="label"
							mode="multiple"
							onChange={(val) => {
								setCurrentFilter((prev) => ({
									...prev,
									warehouses: val,
								}));
							}}
							options={optionsWarehouse}
							value={currentFilter.warehouses}
						/>
					</Col>
				</Row>
				<Row align={"middle"} style={{ marginTop: 15 }}>
					<Col span={4}>
						<Text style={{ width: "100%" }}>UpS:</Text>
					</Col>
					<Col span={20}>
						<Select
							style={{ width: "100%" }}
							placeholder="Chọn UpS"
							showSearch
							optionFilterProp="label"
							mode="multiple"
							onChange={(val) => {
								setCurrentFilter((prev) => ({
									...prev,
									ups: val,
								}));
							}}
							options={optionSmes}
							value={currentFilter.ups}
						/>
					</Col>
				</Row>
				<Row align={"middle"} style={{ marginTop: 15 }}>
					<Col span={4}>
						<Text style={{ width: "100%" }}>Người tạo danh sách:</Text>
					</Col>
					<Col span={20}>
						<Select
							style={{ width: "100%" }}
							placeholder="Chọn ngườii tạo danh sách"
							optionFilterProp="label"
							showSearch
							mode="multiple"
							onChange={(val) => {
								setCurrentFilter((prev) => ({
									...prev,
									createBy: val,
								}));
							}}
							options={optionPIC}
							value={currentFilter?.createBy}
						/>
					</Col>
				</Row>
			</Drawer>
		</>
	);
};

export default ProcessingListFilterDrawer;
