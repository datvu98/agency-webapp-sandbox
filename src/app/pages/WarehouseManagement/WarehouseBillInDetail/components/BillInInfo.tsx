import React, { useMemo } from "react";
import { Col, Collapse, Flex, Row, Tabs, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from 'querystring'
import { omit } from "lodash";
import { TABS } from "../constants";
import CheckInInfo from "./CheckInInfo";
import ReceiveInfo from "./ReceiveInfo";
import PutAwayInfo from "./PutAwayInfo";

const { Text, Paragraph } = Typography;

const BillInInfo = ({ dataDetail, optionSubUsers }) => {
    const navigate = useNavigate();
    const location = useLocation()
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    return (
        <>
            <Collapse
                items={[
                    {
                        key: "general",
                        label: (
                                <Text>THÔNG TIN PHIÊN NHẬP HÀNG</Text>
                        ),
                        children: <Flex vertical>
                            <Tabs
                                onChange={(key) => {
                                    navigate(`${location.pathname}?tab=${key}`);
                                }}
                                activeKey={params?.tab || "check_in"}
                                items={TABS}
                            />
                            {(!params?.tab || params?.tab == 'check_in') && <CheckInInfo dataDetail={dataDetail}/>}
                            {params?.tab == 'receive' && <ReceiveInfo dataDetail={dataDetail} optionSubUsers={optionSubUsers}/>}
                            {params?.tab == 'put_away' && <PutAwayInfo dataDetail={dataDetail} optionSubUsers={optionSubUsers}/>}
                        </Flex>,
                    },
                ]}
            />
        </>
    );
};

export default BillInInfo;
