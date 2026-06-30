import React from 'react';
import { Card } from 'antd';
import { LineChart, ReportTable } from '../components/Conversation';
import ReportFilter from '../components/ReportFilter';
import classNames from 'classnames';

interface Props {
    lineChartData: any;
    loadingLineChart: boolean;
    isVisible: boolean;
    containerRef: React.Ref<any>;
}

const ReportOverviewV1 = ({ lineChartData, loadingLineChart, isVisible, containerRef }: Props) => (
    <>
        <div ref={containerRef} />
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
        <Card style={{ marginBottom: 50, paddingBottom: 20 }}>
            <ReportTable />
        </Card>
    </>
);

export default ReportOverviewV1;
