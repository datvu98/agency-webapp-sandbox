import React from 'react';
import { Skeleton } from 'antd';
import { LineChart, ReportTable } from '../components/Conversation';
import ReportFilterV3 from './ReportFilterV3';
import { useStylesV3 } from './ReportOverviewV3.styles';

interface Props {
    lineChartData: any;
    loadingLineChart: boolean;
    isVisible: boolean;
    containerRef: React.Ref<any>;
}

const ReportOverviewV3 = ({ lineChartData, loadingLineChart, containerRef }: Props) => {
    const { styles } = useStylesV3();

    return (
        <>
            <div ref={containerRef} />
            <div className={styles.stack}>
                <div className={styles.filterBar}>
                    <ReportFilterV3
                        baseRoute="/report/overview"
                        previousDay={29}
                        showHours
                    />
                </div>
                <div className={styles.chartSection}>
                    {loadingLineChart
                        ? <Skeleton active paragraph={{ rows: 8 }} />
                        : <LineChart chatData={lineChartData} />
                    }
                </div>
                <div className={styles.tableSection}>
                    <div className={styles.tableSectionHeader}>
                        <span className={styles.sectionTitle}>Báo cáo chi tiết</span>
                    </div>
                    <div className={styles.tableContent}>
                        <ReportTable />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportOverviewV3;
