import React from 'react';
import { Skeleton, Typography } from 'antd';
import { LineChart, ReportTable } from '../components/Conversation';
import ReportFilter from '../components/ReportFilter';
import classNames from 'classnames';
import { useStyles } from './ReportOverview.styles';

const { Text } = Typography;

interface Props {
    lineChartData: any;
    loadingLineChart: boolean;
    isVisible: boolean;
    containerRef: React.Ref<any>;
}

const ReportOverviewV2 = ({ lineChartData, loadingLineChart, isVisible, containerRef }: Props) => {
    const { styles } = useStyles();

    return (
        <>
            <div ref={containerRef} />
            <div className={styles.stack}>
                <div className={styles.filterSection}>
                    <ReportFilter
                        classNameFilter={classNames(!isVisible && 'filter-report-fixed-top')}
                        baseRoute="/report/overview"
                        previousDay={29}
                        showHours
                    />
                </div>
                <div className={styles.contentSection}>
                    {loadingLineChart
                        ? <Skeleton active paragraph={{ rows: 8 }} />
                        : <LineChart chatData={lineChartData} />
                    }
                </div>
                <div className={styles.tableSection}>
                    <div className={styles.tableSectionHeader}>
                        <Text className={styles.sectionTitle}>Báo cáo chi tiết</Text>
                    </div>
                    <div className={styles.tableContent}>
                        <ReportTable />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportOverviewV2;
