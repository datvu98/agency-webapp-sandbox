import { AppstoreOutlined, DatabaseOutlined, InboxOutlined, TeamOutlined } from "@ant-design/icons";
import { Card, Col, Empty, Flex, Row, Segmented, Tag, Typography } from 'antd';
import React, { Fragment, memo, useContext, useEffect, useMemo, useState } from "react";
import InfoCustomer from "../components/InfoCustomer";
import InfoOrder from "../components/InfoOrder";
import InfoProduct from "../components/InfoProduct";
import { useSelector } from "react-redux";
import { selectCurrentConverstation } from "../slice/selectors";
import { SocketContext } from "app/contexts/SocketContext";
import InfoQuickMessage from "../components/InfoQuickMessage";

const TabInfo = () => {
    const { currentSegmented, setCurrentSegmented } = useContext(SocketContext);

    useEffect(() => {
        setCurrentSegmented('customer');
    }, []);

    const optionsSegmented = [
        { label: 'Khách hàng', value: 'customer' },
        { label: 'Đơn hàng', value: 'order' },
        { label: 'Sản phẩm', value: 'product' },
        { label: 'Tin nhắn nhanh', value: 'message' },
    ];

    return (
        <div className="chat-tab-info">
            <Segmented
                block
                size="middle"
                value={currentSegmented}
                options={optionsSegmented}
                onChange={value => setCurrentSegmented(value)}
            />
            {currentSegmented == 'customer' && <InfoCustomer />}
            {currentSegmented == 'order' && <InfoOrder />}
            {currentSegmented == 'product' && <InfoProduct />}
            {currentSegmented == 'message' && <InfoQuickMessage />}
        </div>
    )
};

export default memo(TabInfo);