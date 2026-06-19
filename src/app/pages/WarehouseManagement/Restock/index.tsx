import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import queryString from "querystring";
import RestockFilter from "./components/RestockFilter";
import RestockTable from "./components/RestockTable";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";
import { saveAs } from 'file-saver';
import mutate_warehouseBillExportExcel from "graphql/mutations/mutate_warehouseBillExportExcel";
import { queryStorageEquipmentbyIds } from "./constants";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { useLocation } from "react-router-dom";

const Restock = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const location = useLocation()
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const [listStorage, setListStorage] = useState([])
    const { user } = useSelector(selectGlobalSlice);
    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Vận hành nhập" :"Quản lý kho"},
            {
                title: "Lưu kho hàng huỷ"
            },
        ]);
    }, []);


    const [warehouseBillExportExcel, {loading: loadingWarehouseBillExportExcel}] = useMutation(mutate_warehouseBillExportExcel)
    const page = useMemo(() => {
        try {
            let _page = Number(params.page);
            if (!Number.isNaN(_page)) {
                return Math.max(1, _page);
            } else {
                return 1;
            }
        } catch (error) {
            return 1;
        }
    }, [params.page]);

    const limit = useMemo(() => {
        try {
            let _value = Number(params.limit);
            if (!Number.isNaN(_value)) {
                return Math.max(25, _value);
            } else {
                return 25;
            }
        } catch (error) {
            return 25;
        }
    }, [params?.limit]);

    const status = useMemo(() => {
        if (params?.status) {
            return {
                fulfillmentStatus: {
                    _eq: params?.status
                }
            }
        }
        return {
            fulfillmentStatus: {
                _in: ['restocking', 'restocked', 'restock_ready']
            }
        }
    }, [params?.status]);

    const search = useMemo(() => {
        if (params?.q) {
            return {
                _or: [
                    {
                        code: {
                            _ilike: `%${params?.q}%`
                        }
                    },
                    {
                        trackingNumber: {
                            _ilike: `%${params?.q}%`
                        }
                    },
                    {
                        systemPackageNumber: {
                            _ilike: `%${params?.q}%`
                        }
                    }
                ]
            }
        }
        return {}
    }, [params?.q]);

    const {data: dataWarehouseBill, loading: loadingDataWarehouseBill, refetch, error} = useQuery(query_warehouseBillListWithPagination, {
        variables: {
            limit,
            offset: (page-1)*limit,
            where: {
                ...status,
                ...search,
                type: {
                    _eq: 'out'
                },
                protocol: {
                    _eq: 0
                }
            }
        },
        fetchPolicy: 'cache-and-network',
        onCompleted: async (data) => {
            if (data?.warehouseBillListWithPagination?.data?.length) {
                const storageEquipmentIdList = [
                    ...new Set(
                        data?.warehouseBillListWithPagination?.data?.flatMap(bill =>
                        bill?.warehouseBillItems?.flatMap(item =>
                            item?.inventoryLocations?.map(loc => loc?.storageEquipmentId)
                        )
                        ).filter(Boolean)
                    )
                ];
                const listStorageEquipment = await queryStorageEquipmentbyIds(storageEquipmentIdList)
                setListStorage(listStorageEquipment)
            } else {
                setListStorage([])
            }
        }
    })

    const handleExport = useCallback(async () => {
        let {data} = await warehouseBillExportExcel({
            variables: {
                where: {
                    ...status,
                    ...search,
                    type: {
                        _eq: 'out'
                    },
                    protocol: {
                        _eq: 0
                    }
                }
            }
        })
        if (data?.warehouseBillExportExcel?.success) {
            saveAs(data?.warehouseBillExportExcel?.data)
        } else {
            showAlert.error(data?.warehouseBillExportExcel?.message || 'Có lỗi xảy ra. Vui lòng thử lại')
        }
    }, [status, search])
    return (
        // <PackStationWraper>
        <>
            <Helmet titleTemplate="Lưu kho hàng huỷ" defaultTitle="Lưu kho hàng huỷ">
                <meta name="description" content="Lưu kho hàng huỷ" />
            </Helmet>
            
            <Spin spinning={loadingDataWarehouseBill || loadingWarehouseBillExportExcel}>
                <Card className="card-switch" title={false}>
                    <RestockFilter onExport={handleExport}/>
                    <RestockTable dataTable={dataWarehouseBill?.warehouseBillListWithPagination?.data} dataPagination={dataWarehouseBill?.warehouseBillListWithPagination?.meta} refetch={refetch} error={error} listStorage={listStorage}/>
                </Card>
            </Spin>
        </>
        // </PackStationWraper>
    );
};

export default Restock;
