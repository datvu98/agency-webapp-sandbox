import { Button, Col, Flex, Row, Typography, Input, DatePicker, Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import queryString from "querystring";
import { CloseOutlined, FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import _, { omit } from "lodash";
import Paragraph from "antd/es/typography/Paragraph";
import { OPTION_STATUS } from "../constants";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const RestockFilter = ({onExport}) => {
    const navigate = useNavigate();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const [searchText, setSearchText] = useState<string>(params?.q || "");

    return (
        <>
            <Row style={{ marginBottom: 20 }} gutter={10}>
                <Col span={12}>
                    <Input
                        placeholder="Mã kiện hàng/Mã phiếu xuất/Mã vận đơn"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const target = e.target as HTMLInputElement;
                                navigate(
                                    `${location.pathname}?${queryString.stringify({
                                        ...params,
                                        q: target.value,
                                    })}`.replaceAll("%2C", ",")
                                );
                            }
                        }}
                        style={{ borderRadius: 0 }}
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
                <Col span={8}>
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Chọn trạng thái"
                        onChange={(val) => {
                            if (!!val) {
                                navigate(
                                    `${location.pathname}?${queryString.stringify({
                                        ...params,
                                        status: val,
                                    })}`.replaceAll("%2C", ",")
                                );
                            } else {
                                navigate(
                                    `${location.pathname}?${queryString.stringify(omit(params, ['status']))}`.replaceAll("%2C", ",")
                                );
                            }
                            
                        }}
                        allowClear
                        options={OPTION_STATUS}
                        value={params?.status || null}
                    />
                    </Col>
                <Col span={4}>
                        <Flex justify="end">
                            <Button
                                type="primary"
                                className="btn-base"
                                onClick={onExport}
                            >
                                    Xuất dữ liệu
                            </Button>
                    </Flex>
                </Col>
            </Row>
        </>
    );
};

export default RestockFilter;
