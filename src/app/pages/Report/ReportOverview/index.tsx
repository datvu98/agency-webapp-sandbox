import React, { memo, useLayoutEffect, useMemo, useState } from "react";
import { ReportOverviewWrapper } from '../Report.styles';
import { useLayoutContext } from "app/contexts/LayoutContext";
import { Helmet } from "react-helmet-async";
import { Flex, Segmented } from "antd";
import { generateDateDefault } from "../ReportHelper";
import { useQuery } from "@apollo/client";
import { useReportContext } from "app/contexts/ReportContext";
import { useElementOnScreen } from "hooks/useElementOnScreen";
import query_report_charts from "graphql/queries/query_report_charts";
import { useStyles } from './ReportOverview.styles';
import ReportOverviewV1 from './ReportOverviewV1';
import ReportOverviewV2 from './ReportOverviewV2';
import ReportOverviewV3 from './ReportOverviewV3';

const ReportOverview = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const { variablesQuery } = useReportContext();
    const { styles } = useStyles();
    const [version, setVersion] = useState<'v1' | 'v2' | 'v3'>('v1');

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

    const sharedProps = {
        lineChartData,
        loadingLineChart,
        isVisible,
        containerRef,
    };

    return (
        <ReportOverviewWrapper>
            <Helmet
                titleTemplate="Báo cáo tổng quan - UpS"
                defaultTitle="Báo cáo tổng quan - UpS"
            >
                <meta name="description" content="Báo cáo tổng quan - UpS" />
            </Helmet>
            <Flex vertical gap={20}>
                <div className={styles.versionBar}>
                    <Segmented
                        value={version}
                        onChange={(v) => setVersion(v as 'v1' | 'v2' | 'v3')}
                        options={[
                            { label: 'Phiên bản 1', value: 'v1' },
                            { label: 'Phiên bản 2', value: 'v2' },
                            { label: 'Phiên bản 3', value: 'v3' },
                        ]}
                    />
                </div>
                {version === 'v1' && <ReportOverviewV1 {...sharedProps} />}
                {version === 'v2' && <ReportOverviewV2 {...sharedProps} />}
                {version === 'v3' && <ReportOverviewV3 {...sharedProps} />}
            </Flex>
        </ReportOverviewWrapper>
    );
};

export default memo(ReportOverview);
