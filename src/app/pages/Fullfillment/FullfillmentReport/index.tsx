import React, { memo, useLayoutEffect, useMemo } from "react";
import { useLayoutContext } from "app/contexts/LayoutContext";
import { Helmet } from "react-helmet-async";
import { Button, Card, Flex, Tooltip, Typography, Tabs } from "antd";
import { FullfillmentReportWrapper } from "../Fullfillment.style";
import FullfillmentFilter from "../components/FullfillmentFilter";
import classNames from "classnames";
import SLAPieChart from "../components/SLAPieChart";
import SLALineChart from "../components/SLALineChart";
import SLAReportTable from "../components/SLAReportTable";
import queryString from 'querystring';
import dayjs from "dayjs";
import { useQuery } from "@apollo/client";
import query_report_fulfillmentChart from "graphql/queries/query_report_fulfillmentChart";
import { useFullfillmentContext } from "app/contexts/FullfillmentContext";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";

const { Text } = Typography;

const FullfillmentReport = () => {
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const { user } = useSelector(selectGlobalSlice);
    const { appendBreadcrumb } = useLayoutContext();
    const { variablesQuery } = useFullfillmentContext();
    const { store_ids: storeIds } = variablesQuery || {};

    const [from, to] = useMemo(() => {
        if (params?.from && params?.to) {
            return [
                Number(params?.from),
                Number(params?.to),
            ]
        }
        return [
            dayjs(dayjs().subtract(30, 'day')).startOf('day').unix(),
            dayjs(dayjs().subtract(1, 'day')).endOf('day').unix(),
        ]
    }, [params?.from, params?.to])

    const channel_codes = useMemo(() => {
        if (params?.channel_codes) {
            return params?.channel_codes
        }
        return null
    }, [params?.channel_codes])

    const fulfillment_provider_type = useMemo(() => {
        if (params?.services && params?.services != 3) {
            return Number(params?.services)
        }
        if (params?.services == 3) {
            return null
        }
        return 2
    }, [params?.services])

    const store_ids_by_sme = useMemo(() => {
        return storeIds
    }, [storeIds]);

    const sources = useMemo(() => {
        if (params?.sources) {
            return params?.sources
        }
        return null
    }, [params?.sources])

    const store_ids = useMemo(() => {
        if (params?.store_ids) {
            return params?.store_ids
        }
        return store_ids_by_sme
    }, [params?.store_ids, store_ids_by_sme])

    const variables = useMemo(() => {
        return {
            from, to, channel_codes, sources, store_ids: store_ids?.length ? store_ids : '-1', fulfillment_provider_type
        }
    }, [from, to, channel_codes, sources, store_ids, fulfillment_provider_type])


    useLayoutEffect(() => {
        appendBreadcrumb([
            {
                title: 'Báo cáo',
                pathname: '/report',
            },
            {
                title: user?.category_code == 'fulfillment' ? "Báo cáo hạn SLA " : 'Báo cáo Fulfillment',
                pathname: '/report/fullfillment-report',
            },
        ]);
    }, []);
    const onChange = (key: string) => {
        console.log(key);
    };

    return <FullfillmentReportWrapper>
        <Helmet
            titleTemplate={`${user?.category_code == 'fulfillment' ? "Báo cáo hạn SLA " : 'Báo cáo Fulfillment'} - UpS`}
            defaultTitle={`${user?.category_code == 'fulfillment' ? "Báo cáo hạn SLA " : 'Báo cáo Fulfillment'} - UpS`}
        >
            <meta name="description" content={`${user?.category_code == 'fulfillment' ? "Báo cáo hạn SLA " : 'Báo cáo Fulfillment'} - UpS`} />
        </Helmet>
        <Flex vertical gap={20}>
            <Card className="card-filter">
                <FullfillmentFilter
                    classNameFilter={classNames('filter-report-fixed-top')}
                    baseRoute="/report/fullfillment-report"
                    previousDay={29}
                    showHours
                    isReport={true}
                />
            </Card>
            <Card>
                <SLAPieChart variables={variables} />
            </Card>
            <Card>
                <SLALineChart variables={variables} />
            </Card>
            <Card>
                <SLAReportTable variables={variables} />
            </Card>
        </Flex>
    </FullfillmentReportWrapper>
};

export default FullfillmentReport;