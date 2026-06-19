
import { Button, Col, Flex, Row, Typography, Select, Drawer, Image } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import queryString from "querystring";
import { OPTIONS_PROTOCOL, OPTIONS_EVIDENCE } from "../constants";

const { Text } = Typography;
interface FilterType {
    warehouses: number[],
    brands: number[],
    stores: number[],
    protocols: null | number,
    evidence: null | number,
}
const WarehouseBillInListFilterDrawer = ({ showDrawer, setShowDrawer, optionSmes, optionsWarehouse, optionsBrand, optionsStore }) => {
	const navigate = useNavigate();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [currentFilter, setCurrentFilter] = useState<FilterType>({
		warehouses: [],
		brands: [],
		stores: [],
		protocols: null,
		evidence: null,
	});
    
	useEffect(() => {
		setCurrentFilter({
			warehouses: params?.warehouses ? params?.warehouses?.split(",")?.map((item) => Number(item)) : [],
			brands: params?.brands ? params?.brands?.split(",")?.map((item) => Number(item)) : [],
			stores: params?.stores ? params?.stores?.split(",")?.map((item) => Number(item)) : [],
			protocols: params?.protocols ? params?.protocols : null,
			evidence: params?.evidence ? params?.evidence : null,
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
									brands: [],
									stores: [],
									protocols: null,
                                    evidence: null
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
										stores: currentFilter?.stores?.join(","),
										brands: currentFilter?.brands?.join(","),
										protocols: currentFilter?.protocols,
										evidence: currentFilter?.evidence,
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
						<Text style={{ width: "100%" }}>Kho:</Text>
					</Col>
					<Col span={20}>
						<Select
							style={{ width: "100%" }}
							placeholder="Chọn kho"
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
						<Text style={{ width: "100%" }}>Gian hàng:</Text>
					</Col>
					<Col span={20}>
						<Select
							style={{ width: "100%" }}
							placeholder="Chọn gian hàng"
							showSearch
							optionFilterProp="label"
							mode="multiple"
							onChange={(val) => {
								setCurrentFilter((prev) => ({
									...prev,
									stores: val,
								}));
							}}
							options={optionsStore}
							value={currentFilter.stores}
                            optionRender={(option: any) => {
                                return (
                                    <Flex align="center" gap={4}>
                                        <Text>
                                            {!!option?.data?.channel?.logo_asset_url && <Image src={option?.data?.channel?.logo_asset_url} preview={false} width={18} height={18} alt="" />}
                                        </Text>
                                        <Text>{option?.label}</Text>
                                    </Flex>
                                );
                            }}
                            tagRender={({ label, value, closable, onClose }) => {
                                const option: any = optionsStore.find((op: any) => op.value === value);

                                return (
                                    <Flex align="center" gap={4} className="ant-select-selection-item">
                                        <Flex align="center" gap={4}>
                                            <Text>{!!option?.channel?.logo_asset_url && <Image src={option?.channel?.logo_asset_url} preview={false} width={18} height={18} alt="" />}</Text>
                                            <Text>{option?.label}</Text>
                                        </Flex>
                                        {closable && (
                                            <Text onClick={onClose} style={{ marginLeft: 4, cursor: "pointer" }}>
                                                ×
                                            </Text>
                                        )}
                                    </Flex>
                                );
                            }}
						/>
					</Col>
				</Row>
				<Row align={"middle"} style={{ marginTop: 15 }}>
					<Col span={4}>
						<Text style={{ width: "100%" }}>Nhãn quản lý:</Text>
					</Col>
					<Col span={20}>
						<Select
							style={{ width: "100%" }}
							placeholder="Chọn nhãn quản lý"
							optionFilterProp="label"
							showSearch
							mode="multiple"
							onChange={(val) => {
								setCurrentFilter((prev) => ({
									...prev,
									brands: val,
								}));
							}}
							options={optionsBrand}
							value={currentFilter?.brands}
						/>
					</Col>
				</Row>
                <Row align={"middle"} style={{ marginTop: 15 }}>
					<Col span={4}>
						<Text style={{ width: "100%" }}>Hình thức:</Text>
					</Col>
					<Col span={20}>
						<Select
							style={{ width: "100%" }}
							placeholder="Tất cả"
							optionFilterProp="label"
							showSearch
							onChange={(val) => {
								setCurrentFilter((prev) => ({
									...prev,
									protocols: val,
								}));
							}}
							options={OPTIONS_PROTOCOL}
							value={currentFilter?.protocols}
						/>
					</Col>
				</Row>
                <Row align={"middle"} style={{ marginTop: 15 }}>
					<Col span={4}>
						<Text style={{ width: "100%" }}>Thông tin chứng từ:</Text>
					</Col>
					<Col span={20}>
						<Select
							style={{ width: "100%" }}
							placeholder="Tất cả"
							optionFilterProp="label"
							showSearch
							onChange={(val) => {
								setCurrentFilter((prev) => ({
									...prev,
									evidence: val,
								}));
							}}
							options={OPTIONS_EVIDENCE}
							value={currentFilter?.evidence}
						/>
					</Col>
				</Row>
			</Drawer>
		</>
	);
};

export default WarehouseBillInListFilterDrawer;
