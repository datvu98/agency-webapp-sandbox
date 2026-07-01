import React, { memo, useLayoutEffect, useMemo } from "react";
import { ReportOverviewWrapper } from '../Report.styles';
import { useLayoutContext } from "app/contexts/LayoutContext";
import { Helmet } from "react-helmet-async";
import { generateDateDefault } from "../ReportHelper";
import { useQuery } from "@apollo/client";
import { useReportContext } from "app/contexts/ReportContext";
import { useElementOnScreen } from "hooks/useElementOnScreen";
import query_report_charts from "graphql/queries/query_report_charts";
import ReportOverviewContent from './ReportOverview';

const ReportOverview = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const { variablesQuery } = useReportContext();

    const variables = useMemo(() => ({
        ...generateDateDefault(29, true),
        ...variablesQuery,
    }), [variablesQuery]);

    const { data: lineChartData, loading: loadingLineChart } = useQuery(query_report_charts, {
        variables,
        fetchPolicy: 'cache-and-network',
    });

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: 'Báo cáo', pathname: '/report' },
            { title: 'Tổng quan', pathname: '/report/overview' },
        ]);
    }, []);

    const [containerRef, isVisible] = useElementOnScreen({
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
    }) as any;

    return (
        <ReportOverviewWrapper>
            <Helmet
                titleTemplate="Báo cáo tổng quan - UpS"
                defaultTitle="Báo cáo tổng quan - UpS"
            >
                <meta name="description" content="Báo cáo tổng quan - UpS" />
            </Helmet>
            <ReportOverviewContent
                lineChartData={lineChartData}
                loadingLineChart={loadingLineChart}
                isVisible={isVisible}
                containerRef={containerRef}
            />
        </ReportOverviewWrapper>
    );
};

export default memo(ReportOverview);
