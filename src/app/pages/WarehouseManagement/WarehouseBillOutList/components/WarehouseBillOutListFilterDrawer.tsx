import React, { useEffect, useState } from "react";
import {
    Button,
    Col,
    Flex,
    Row,
    Typography,
    Select,
    Drawer,
    Image,
} from "antd";
import queryString from "querystring";
import { useNavigate } from "react-router-dom";
import { OPTIONS_PROTOCOL_OUT } from "../constants";
import { omit } from "lodash";

const { Text } = Typography;

interface FilterType {
    smes: number[],
    warehouses: number[],
    brands: number[],
    stores: number[],
    protocols: number[],
}

const WarehouseBillOutListFilterDrawer = ({ setShowDrawer, showDrawer, optionSmes, optionsWarehouse, optionsStore, optionsBrand }) => {
    const navigate = useNavigate();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const [currentFilter, setCurrentFilter] = useState<FilterType>({
        smes: [],
        warehouses: [],
        brands: [],
        stores: [],
        protocols: [],
    });

    useEffect(() => {
        setCurrentFilter({
            smes: params?.ups ? params?.ups?.split(",")?.map((item) => Number(item)) : [], 
            warehouses: params?.warehouses ? params?.warehouses?.split(",")?.map((item) => Number(item)) : [],
            stores: params?.stores ? params?.stores?.split(",")?.map((item) => Number(item)) : [],
            brands: params?.brands ? params?.brands?.split(",")?.map((item) => Number(item)) : [],
			protocols: params?.protocols ? params?.protocols?.split(",") : [],
            });
    }, []);

    return (
        <>
            <Drawer
                title="Bộ lọc nâng cao"
                closable={false}
                size="large"
                open={showDrawer}
                footer={
                    <Flex gap={10} justify="end">
                        <Button 
                            className="btn-base"
                            onClick={() => {
                                setShowDrawer(false);
								setCurrentFilter({
                                    smes: [],
									warehouses: [],
									brands: [],
									stores: [],
									protocols: [],
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
                                        smes: currentFilter?.smes?.join(","),
                                        warehouses: currentFilter?.warehouses?.join(","),
                                        stores: currentFilter?.stores?.join(","),
                                        brands: currentFilter?.brands?.join(","),
                                        protocols: currentFilter?.protocols?.join(","),
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
                                navigate(
                                    `${location.pathname}?${queryString.stringify(
                                        omit(
                                            {
                                                ...params,
                                                ups: val.join(","),
                                                page: 1
                                            },
                                            ["stores", "brands"]
                                        )
                                    )}`.replaceAll("%2C", ",")
                                );
                            }}
                            options={optionSmes}
                            value={params?.ups ? params?.ups?.split(",")?.map((item) => Number(item)) : []}
                        />
                    </Col>
                </Row>
                <Row align={"middle"} style={{ marginTop: 15 }}>
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
                            value={currentFilter?.warehouses}
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
                            value={currentFilter?.stores}
                            optionRender={(option: any) => {
                                return (
                                    <Flex align="center" gap={10}>
                                        {!!option?.data?.channel?.logo_asset_url && (
                                            <Image
                                                src={option?.data?.channel?.logo_asset_url}
                                                preview={false}
                                                width={18}
                                                height={18}
                                                alt=""
                                                style={{ display: "block" }}
                                            />
                                        )}
                                        <Text>
                                            {option?.label}
                                        </Text>
                                    </Flex>
                                );
                            }}
                            tagRender={({ label, value, closable, onClose }) => {
                                const option: any = optionsStore.find((op: any) => op?.value === value);

                                return (
                                    <Flex align="center" gap={8} className="ant-select-selection-item">
                                        <Flex align="center" gap={6}>
                                            {!!option?.channel?.logo_asset_url && (
                                                <Image
                                                    src={option?.channel?.logo_asset_url}
                                                    preview={false}
                                                    width={18}
                                                    height={18}
                                                    alt=""
                                                    style={{ display: "block" }}
                                                />
                                            )}
                                            <Text>
                                                {option?.label}
                                            </Text>
                                        </Flex>

                                        {closable && (
                                            <Text
                                                onClick={onClose}
                                                style={{ marginLeft: 4, cursor: "pointer", lineHeight: 1 }}
                                            >
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
                            mode="multiple"
                            allowClear
                            onChange={(val) => {
                                setCurrentFilter((prev) => ({
                                    ...prev,
                                    protocols: val,
                                }));
                            }}
                            options={OPTIONS_PROTOCOL_OUT}
                            value={currentFilter?.protocols}
                        />
                    </Col>
                </Row>
            </Drawer>
        </>
    );
};

export default WarehouseBillOutListFilterDrawer;
