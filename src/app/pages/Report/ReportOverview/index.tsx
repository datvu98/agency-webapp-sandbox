import React, { memo, useLayoutEffect, useMemo } from "react";
import { ReportOverviewWrapper } from '../Report.styles';
import { useLayoutContext } from "app/contexts/LayoutContext";
import { Helmet } from "react-helmet-async";
import { Button, Card, Flex, Tooltip, Typography } from "antd";
import ReportFilter from "../components/ReportFilter";
import { DonutPieChart, LineChart } from "../components/Conversation";
import { FileExcelOutlined } from '@ant-design/icons';
import { ReportTable } from "../components/Conversation";
import { generateDateDefault } from "../ReportHelper";
import { useQuery } from "@apollo/client";
import { ReportProvider, useReportContext } from "app/contexts/ReportContext";
import query_conversionBar from 'graphql/queries/query_chartReportConversationBar';
import query_conversionTrend from 'graphql/queries/query_chatReportConversationTrend';
import { useElementOnScreen } from "hooks/useElementOnScreen";
import classNames from "classnames";
import query_report_charts from "graphql/queries/query_report_charts";

const { Text } = Typography;

const ReportOverview = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const { variablesQuery } = useReportContext();

    const variables = useMemo(() => {
        return {
            ...generateDateDefault(29, true),
            ...variablesQuery
        }
    }, [variablesQuery]);
    console.log(variables)
    const { data: lineChartData, loading: loadingLineChart } = useQuery(query_report_charts, {
        variables,
        fetchPolicy: 'cache-and-network'
    });
    useLayoutEffect(() => {
        appendBreadcrumb([
            {
                title: 'Báo cáo',
                pathname: '/report',
            },
            {
                title: 'Tổng quan',
                pathname: '/report/overview',
            },
        ]);
    }, []);

    const [containerRef, isVisible] = useElementOnScreen({
        root: null,
        rootMargin: "0px",
        threshold: 1.0
    }) as any;

    return <ReportOverviewWrapper>
        <Helmet
            titleTemplate="Báo cáo tổng quan - UpS"
            defaultTitle="Báo cáo tổng quan - UpS"
        >
            <meta name="description" content="Báo cáo tổng quan - UpS" />
        </Helmet>
        <Flex vertical gap={20}>
            <div ref={containerRef}></div>
            <Card className="card-filter">
                <ReportFilter
                    classNameFilter={classNames(!isVisible && 'filter-report-fixed-top')}
                    baseRoute="/report/overview"
                    previousDay={29}
                    showHours
                />
            </Card>
            <Card loading={loadingLineChart}>
                <LineChart chatData={lineChartData} />
            </Card>
            {/* <Card loading={loadingPieChart}>
                <Flex className="w-100" wrap="wrap" vertical={true}>
                    <Text className="title-card" strong>Tỷ lệ theo gian hàng</Text>
                    <Flex gap={20} flex={1} justify="space-around" wrap="wrap" >
                        {pieChartData?.chatReportConversationBar?.map((item) => {
                            return <Flex vertical={true} justify="center" align="center">
                                <DonutPieChart title={item.title} chatData={item} />
                                <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                            </Flex>
                        })}
                    </Flex>
                </Flex>
            </Card> */}
            <Card style={{ marginBottom: 50, paddingBottom: 20 }}>
                <ReportTable />
            </Card>
        </Flex>
    </ReportOverviewWrapper>
};

export default memo(ReportOverview);