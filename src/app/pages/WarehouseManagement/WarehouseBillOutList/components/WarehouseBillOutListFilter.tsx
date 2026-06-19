import React, { useState, useEffect, useMemo } from "react";
import {
    Button,
    Col,
    Flex,
    Row,
    Typography,
    Input,
    DatePicker,
    Select,
    Image,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import queryString from "querystring";
import {
    SEARCH_OPTIONS_BILL_OUT,
    STATUS_BILL_OUT_OPTIONS,
    SEARCH_OPTIONS,
    OPTIONS_PROTOCOL_OUT
} from "../constants";
import _, { omit } from "lodash";
import { CloseOutlined, FilterOutlined } from "@ant-design/icons";
import Paragraph from "antd/es/typography/Paragraph";
import WarehouseBillOutListFilterDrawer from "./WarehouseBillOutListFilterDrawer";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const WarehouseBillOutListFilter = ({ optionSmes, optionsWarehouse, optionsStore, optionsBrand }) => {
    const navigate = useNavigate();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const [dateRange, setDateRange] = useState<any>([
        dayjs().subtract(6, "day").startOf("day"),
        dayjs().endOf("day"),
    ]);
    const [searchText, setSearchText] = useState<string>(params?.q || "");
    const [showDrawer, setShowDrawer] = useState(false);

    useEffect(() => {
        if (params?.q) {
            setSearchText(String(params?.q || ""));
        }
    }, [params?.q]);

    // Block của bộ lọc nâng cao
    const filterBlock = useMemo(() => {
        const blockSmes = optionSmes?.filter((_option) => params?.ups?.split(",")?.some((param) => param == _option?.value));
        const blockWarehouse = optionsWarehouse?.filter((_option) => params?.warehouses?.split(",")?.some((param) => param == _option?.value));
        const blockBrand = optionsBrand?.filter((_option) => params?.brands?.split(",")?.some((param) => param == _option?.value));
        const blockStore = optionsStore?.filter((_option) => params?.stores?.split(",")?.some((param) => param == _option?.value));
        const blockProtocol = OPTIONS_PROTOCOL_OUT?.filter((_option) => params?.protocols?.split(",")?.some((param) => param == _option?.value));

        return (
            <Flex style={{ gap: 10 }} wrap="wrap">
                {blockSmes?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 8,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`UpS: ${_.map(blockSmes, (item) => item?.label)?.join(", ")}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 7 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "ups"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
                {blockWarehouse?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 8,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`Kho vật lý: ${_.map(blockWarehouse, (item) => item?.label)?.join(", ")}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 7 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "warehouses"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
                {blockStore?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 8,
						}}
					>
						<Flex gap={4}>
							<Text>Gian hàng:</Text>
							<Flex gap={4}>
								{blockStore.map((item, index) => {
									return (
                                        <Flex align="center" gap={6}>
                                            {index !== 0 && <Text>,</Text>}

                                            {!!item?.channel?.logo_asset_url && (
                                                <Image
                                                    src={item?.channel?.logo_asset_url}
                                                    preview={false}
                                                    width={18}
                                                    height={18}
                                                    alt=""
                                                    style={{ display: "block" }}
                                                />
                                            )}

                                            <Text>{item?.label}</Text>
                                        </Flex>
									);
								})}
							</Flex>
						</Flex>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 7 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "stores"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
				{blockBrand?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 8,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`Nhãn quản lý: ${_.map(blockBrand, (item) => item.label)?.join(", ")}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 7 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "brands"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
                {blockProtocol?.length > 0 && (
                    <Flex
                        align="center"
                        justify="between"
                        style={{
                            border: "1px solid #ff6d49",
                            borderRadius: 20,
                            background: "rgba(255,109,73, .1)",
                            marginBottom: 4,
                            padding: 8,
                        }}
                    >
                        <Paragraph style={{ marginBottom: 0 }} ellipsis>{`Hình thức: ${_.map(blockProtocol, (item) => item.label)?.join(", ")}`}</Paragraph>
                        <CloseOutlined
                            style={{ cursor: "pointer", marginLeft: 7 }}
                            onClick={() => {
                                navigate(
                                    `${location.pathname}?${queryString.stringify({
                                        ..._.omit(params, "protocols"),
                                    })}`.replaceAll("%2C", ",")
                                );
                            }}
                        />
                    </Flex>
                )}
            </Flex>
        )
    }, [params])

    return (
        <>
            {showDrawer && (
                <WarehouseBillOutListFilterDrawer 
                    showDrawer={showDrawer}
					setShowDrawer={setShowDrawer}
                    optionSmes={optionSmes}
                    optionsWarehouse={optionsWarehouse}
                    optionsStore={optionsStore}
                    optionsBrand={optionsBrand}
                />
            )}
            <Row style={{ marginBottom: 20 }} gutter={10}>
                {/* Filter 1 */}
                <Col span={16}>
                    <Row align={"middle"}>
                        <Col span={8}>
                            <Select
                                style={{ width: "100%" }}
                                className="custom-border"
                                onChange={(val) => {
                                    navigate(
                                        `${
                                            location.pathname
                                        }?${queryString.stringify({
                                            ...params,
                                            page: 1,
                                            date_search_type: val,
                                        })}`.replaceAll("%2C", ",")
                                    );
                                }}
                                options={SEARCH_OPTIONS_BILL_OUT}
                                value={
                                    params?.date_search_type ||
                                    SEARCH_OPTIONS_BILL_OUT[0]?.value
                                }
                            />
                        </Col>
                        <Col span={16}>
                            <RangePicker
                                className="custom-border"
                                style={{ width: "100%", borderRadius: 0 }}
                                value={dateRange as any}
                                showTime={{ format: "HH:mm" }}
                                format={"DD/MM/YYYY HH:mm"}
                                onChange={(values: any) => {
                                    if (values && values.length === 2) {
                                        // Chọn range
                                        const [start, end] = values;
                                        navigate(
                                            `${
                                                location.pathname
                                            }?${queryString.stringify({
                                                ...params,
                                                gt: start.unix(),
                                                lt: end.unix(),
                                                page: 1,
                                            })}`
                                        );
                                        setDateRange(values);
                                    } else {
                                        setDateRange([
                                            dayjs()
                                                .subtract(6, "day")
                                                .startOf("day"),
                                            dayjs().endOf("day"),
                                        ]);

                                        navigate(
                                            `${
                                                location.pathname
                                            }?${queryString.stringify(
                                                omit(params, ["gt", "lt"])
                                            )}`
                                        );
                                    }
                                }}
                            />
                        </Col>
                    </Row>
                </Col>
                {/* Filter 2 */}
                <Col span={8}>
                    <Select
                        style={{ width: "100%" }}
                        className="custom-border"
                        placeholder="Trạng thái phiếu"
                        mode="multiple"
                        allowClear={true}
                        onChange={(values) => {
                            if (values?.length) {
                                navigate(
                                    `${
                                        location.pathname
                                    }?${queryString.stringify({
                                        ...params,
                                        page: 1,
                                        status: values?.join(","),
                                    })}`.replaceAll("%2C", ",")
                                );
                            } else {
                                navigate(
                                    `${
                                        location.pathname
                                    }?${queryString.stringify(
                                        omit(params, ["status"])
                                    )}`.replaceAll("%2C", ",")
                                );
                            }
                        }}
                        options={STATUS_BILL_OUT_OPTIONS}
                        value={params?.status?.split(",")}
                    />
                </Col>
            </Row>
            <Row style={{ marginBottom: 20 }} gutter={10}>
                {/* Filter 3 */}
                <Col span={16}>
                    <Row align={"middle"}>
                        <Col span={8}>
                            <Select
                                style={{ width: "100%" }}
                                className="custom-border"
                                onChange={(val) => {
                                    navigate(
                                        `${
                                            location.pathname
                                        }?${queryString.stringify({
                                            ...params,
                                            page: 1,
                                            search_type: val,
                                        })}`.replaceAll("%2C", ",")
                                    );
                                }}
                                options={SEARCH_OPTIONS}
                                value={
                                    params?.search_type ||
                                    SEARCH_OPTIONS[0]?.value
                                }
                            />
                        </Col>
                        <Col span={16}>
                            <Input
                                placeholder={
                                    SEARCH_OPTIONS?.find(
                                        (opt) =>
                                            opt?.value == params?.search_type
                                    )?.placeholder ||
                                    SEARCH_OPTIONS[0]?.placeholder
                                }
                                onKeyDown={(e) => {
                                    if (e?.key === "Enter") {
                                        const target =
                                            e?.target as HTMLInputElement;
                                        navigate(
                                            `${
                                                location.pathname
                                            }?${queryString.stringify({
                                                ...params,
                                                q: target?.value,
                                                page: 1,
                                            })}`.replaceAll("%2C", ",")
                                        );
                                    }
                                }}
                                style={{ borderRadius: 0 }}
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e?.target?.value);
                                }}
                                onBlur={(e) => {
                                    navigate(
                                        `${location.pathname}?${queryString.stringify({
                                            ...params,
                                            q: e?.target?.value,
                                        })}`.replaceAll("%2C", ",")
                                    );
                                }}
                            />
                        </Col>
                    </Row>
                </Col>
                {/* Bộ lọc nâng cao */}
                <Col span={8}>
                    <Button
                        type="default"
                        style={{ width: "100%" }}
                        onClick={() => {
							setShowDrawer(true);
						}}
                    >
						<Flex align="center" justify="space-between" style={{ width: "100%" }}>
							<Text>Bộ lọc nâng cao</Text>
							<FilterOutlined />
						</Flex>
                    </Button>
                </Col>
            </Row>
            <Row>{filterBlock}</Row>
        </>
    );
};

export default WarehouseBillOutListFilter;
