import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Tabs } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { ReturnReceiptWraper } from "../Warehouse.styles";
import queryString from "querystring";
// import ReturnReceiptTable from "./components/ReturnReceiptTable";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import ReturnReceiptFilter from "./components/ReturnReceiptFilter";
import ReturnReceiptTable from "./components/ReturnReceiptTable";
import query_workSessionWithPagination from "graphql/queries/query_workSessionWithPagination";
import query_listReturnReceiptShippingCarriers from "graphql/queries/query_listReturnReceiptShippingCarriers";
import { TABS } from "./constants";
import SpecialOrder from "./components/SpecialOrderTable";

const { Text } = Typography;

const ReturnReceipt = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const { user } = useSelector(selectGlobalSlice);
    const params = queryString.parse(location.search.slice(1, 100000)) as any;

    useLayoutEffect(() => {
        appendBreadcrumb([
            {
                title: "Quản lý kho"
            },
            {
                title: "Quản lý Nhận hoàn trả"
            },
        ]);
    }, []);

    const {data: dataListShippingCarrier, loading: loadingDataListShippingCarrier} = useQuery(query_listReturnReceiptShippingCarriers, {
        fetchPolicy: 'cache-and-network'
    })

    const listShippingCarrier = useMemo(() => {
        if (!dataListShippingCarrier?.listReturnReceiptShippingCarriers?.data?.length) return []
        return dataListShippingCarrier?.listReturnReceiptShippingCarriers?.data?.map((carrier: {name: string, code: string}) => ({
            label: carrier?.name,
            value: carrier?.code
        }))
    }, [dataListShippingCarrier])
    
    return (
        <ReturnReceiptWraper>
            <Helmet titleTemplate="Quản lý Nhận hoàn trả" defaultTitle="Quản lý Nhận hoàn trả">
                <meta name="description" content="Quản lý Nhận hoàn trả" />
            </Helmet>
            <Spin spinning={loadingDataListShippingCarrier}>
                <Card className="card-switch" title={false}>
                    <Tabs
                        onChange={(key) => {
                            navigate(`${location.pathname}?tab=${key}`);
                        }}
                        type="card"
                        items={TABS}
                    />
                    <ReturnReceiptFilter listShippingCarrier={listShippingCarrier}/>
                    {params?.tab != 'special_order' && <>
                        <ReturnReceiptTable listShippingCarrier={listShippingCarrier}/>
                    </>}
                    {params?.tab == 'special_order' && <>
                        <SpecialOrder listShippingCarrier={listShippingCarrier}/>
                    </>}
                </Card>
            </Spin>
        </ReturnReceiptWraper>
    );
};

export default ReturnReceipt;
