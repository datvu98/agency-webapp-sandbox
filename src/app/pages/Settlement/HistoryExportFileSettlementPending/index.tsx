
import React, { useLayoutEffect } from 'react'
import SVG from "react-inlinesvg";
import { Helmet } from 'react-helmet-async';
import { Card, Flex, Typography } from 'antd';
import { useLayoutContext } from 'app/contexts/LayoutContext';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Table from './Table';
import { SettlementWrapper } from '../Settlement.style';
const { Text } = Typography
const HistoryExportFileSettlementPending = () => {
    const { appendBreadcrumb } = useLayoutContext();

    useLayoutEffect(() => {
        appendBreadcrumb([
            {
                title: 'Lịch sử xuất phiếu chờ quyết toán',
                pathname: '/settlement-manage/exportfile-settlement-pending',
            },

        ]);
    }, []);

    return (
        <SettlementWrapper>
            <a
                href="/settlement-manage/manual"
                style={{ display: "block", color: "#ff5629", margin: '10px 0' }}
            >
                <Flex gap={5}>
                    <ArrowLeftOutlined />
                    <Text style={{ color: '#ff5629' }}>Quay lại danh sách chờ quyết toán</Text>
                </Flex>
            </a>
            <Card>
                <Helmet
                    titleTemplate={"Lịch sử xuất phiếu chờ quyết toán - Upbase"}
                    defaultTitle={"Lịch sử xuất phiếu chờ quyết toán - Upbase"}
                >
                    <meta name="description" content={"Lịch sử xuất phiếu chờ quyết toán - Upbase"} />
                </Helmet>

                <Table />
            </Card>
        </SettlementWrapper>
    );
}

export default HistoryExportFileSettlementPending