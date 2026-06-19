
import React, { useLayoutEffect } from 'react'
import { useQuery } from '@apollo/client';
import SVG from "react-inlinesvg";
import { useLayoutContext } from 'app/contexts/LayoutContext';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import { SettlementWrapper } from '../Settlement.style';
import { Helmet } from 'react-helmet-async';
import Table from './Table';

const { Text } = Typography
const HistoryExportFileSettlementProcessed = () => {
    const { appendBreadcrumb } = useLayoutContext();

    useLayoutEffect(() => {
        appendBreadcrumb([
            {
                title: 'Lịch sử xuất phiếu đã quyết toán',
                pathname: '/settlement-manage/exportfile-settlement-processed',
            },

        ]);
    }, []);

    return (
        <SettlementWrapper>
            <a
                href="/settlement-manage/manual?page=1&tab=PROCESSED"
                style={{ display: "block", color: "#ff5629", margin: '10px 0' }}

            >
                <ArrowLeftOutlined />
                <Text style={{ color: '#ff5629' }}>Quay lại danh sách đã quyết toán</Text>
            </a>
            <Card>
                <Helmet
                    titleTemplate={"Lịch sử xuất phiếu đã quyết toán  - Upbase"}
                    defaultTitle={"Lịch sử xuất phiếu đã quyết toán  - Upbase"}
                >
                    <meta name="description" content={"Lịch sử xuất phiếu đã quyết toán - Upbase"} />
                </Helmet>

                <Table />
            </Card>
        </SettlementWrapper>
    );
}

export default HistoryExportFileSettlementProcessed
