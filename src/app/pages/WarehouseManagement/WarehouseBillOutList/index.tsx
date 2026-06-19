import React, { useLayoutEffect, useMemo } from "react";
import { useLayoutContext } from "app/contexts/LayoutContext";
import queryString from "querystring";
import { WarehouseBillOutWrapper } from "../Warehouse.styles";
import { Helmet } from "react-helmet-async";
import { Spin, Card } from "antd";
import WarehouseBillOutListFilter from "./components/WarehouseBillOutListFilter";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import { useQuery } from "@apollo/client";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import query_smeStore from "graphql/queries/query_smeStore";
import query_sme_brands from "graphql/queries/query_sme_brands";
import WarehouseBillOutListTable from "./components/WarehouseBillOutListTable";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";
import dayjs from "dayjs";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { useLocation } from "react-router-dom";

const WarehouseBillOutList = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const location = useLocation()
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const { user } = useSelector(selectGlobalSlice);

    const { data: dataSmes, loading: loadingDataSmes } = useQuery(query_agencyGetSme, {
        fetchPolicy: "cache-and-network",
    });

    const { data: dataWarehouse, loading: loadingDataWarehouse } = useQuery(query_sme_warehouse_list, {
        variables: {
            where: {
                fulfillment_by: { _eq: 1 },
                status: { _eq: 10 },
            },
        },
        fetchPolicy: "cache-and-network",
    });

    const { data: dataStores, loading: loadingDataStores } = useQuery(query_smeStore, {
        fetchPolicy: 'cache-and-network'
    });

    const { data: dataScListConnectorStoreAgency, loading: loadingDataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        variables: {
            status: [1]
        },
        fetchPolicy: 'cache-and-network'
    })

    const { data: dataBrands } = useQuery(query_sme_brands, {
        fetchPolicy: "cache-and-network",
    });

    const smeId = useMemo(() => {
        if (params?.ups) {
            return {
                smeId: {
                    _in: params?.ups?.split(',')?.map(item => Number(item))
                }
            }
        }
        return {}
    }, [params?.ups])

    const warehouseId = useMemo(() => {
        if (params?.warehouses) {
            return {
                warehouseId: {
                    _in: params?.warehouses?.split(',')?.map(item => Number(item))
                }
            }
        }
        return {}
    }, [params?.warehouses])

    const brandId = useMemo(() => {
        if (params?.brands) {
            return {
                brandId: {
                    _in: params?.brands?.split(',')?.map(item => Number(item))
                }
            }
        }
        return {}
    }, [params?.brands])

    const storeId = useMemo(() => {
        if (params?.stores) {
            return {
                storeId: {
                    _in: params?.stores?.split(',')?.map(item => Number(item))
                }
            }
        }
        return {}
    }, [params?.stores])

    const protocol = useMemo(() => {
        if (params?.protocols?.length) {
            return {
                protocol: {
                    _in: params?.protocols?.split(',')?.map(item => Number(item))
                }
            }
        }
        return {}
    }, [params?.protocols])

    const time = useMemo(() => {
        try {
            let rangeTimeConvert:any = []
            if (!params.gt || !params.lt) {
                rangeTimeConvert = [dayjs().subtract(6, 'day').startOf('day').toISOString(), dayjs().endOf('day').toISOString()]
            } else {
                rangeTimeConvert = [params?.gt, params?.lt]?.map((_range) => new Date(_range * 1000).toISOString());
            }
            if (params?.date_search_type == "processed_at") {
                return {
                    processedAt: {
                        _gt: rangeTimeConvert[0],
                        _lt: rangeTimeConvert[1],
                    },
                };
            }

            return {
                createdAt: {
                    _gt: rangeTimeConvert[0],
                    _lt: rangeTimeConvert[1],
                },
            };
        } catch (error) {
            return {};
        }
    }, [params?.gt, params?.lt, params?.date_search_type]);

    const status = useMemo(() => {
        if(!params?.status) {
            return {}
        }
        return {
            fulfillmentStatus: {
                _in: params?.status?.split(',')
            }
        }
    }, [params?.status])

    const search = useMemo(() => {
        try {
            if (!params.q) return {};

            const keyword = `%${params.q}%`;
            if (params?.search_type == "order_code") {
                return {
                    orderCode: {
                        _ilike: keyword
                    },
                };
            }

            if (params?.search_type == "shipping_code") {
                return {
                    shippingCode: {
                        _ilike: keyword
                    },
                };
            }

            if (params?.search_type == "return_order_code") {
                return {
                    returnOrderCode: {
                        _ilike: keyword
                    },
                };
            }

            if (params?.search_type == "return_tracking_number") {
                return {
                    returnTrackingNumber: {
                        _ilike: keyword
                    },
                };
            }

            return {
                code: {
                    _ilike: keyword
                },
            };
        } catch (error) {
            return {};
        }
    }, [params?.q , params?.search_type]);

    const variables = useMemo(() => {
        return {
            ...smeId,
            ...warehouseId,
            ...brandId,
            ...storeId,
            ...protocol,
            ...time,
            ...status,
            ...search,
        }
    }, [smeId, warehouseId, brandId, storeId, protocol, time, status, search])

    const page = useMemo(() => {
        try {
            let _page = Number(params?.page);
            if (!Number.isNaN(_page)) {
                return Math.max(1, _page);
            } else {
                return 1;
            }
        } catch (error) {
            return 1;
        }
    }, [params?.page]);

    const limit = useMemo(() => {
        try {
            let _value = Number(params?.limit);
            if (!Number.isNaN(_value)) {
                return Math.max(25, _value);
            } else {
                return 25;
            }
        } catch (error) {
            return 25;
        }
    }, [params?.limit]);

    const {data: dataWarehouseBillList, loading: loadingDataWarehouseBillList, error, refetch} = useQuery(query_warehouseBillListWithPagination, {
        variables: {
            limit,
            offset: (page - 1) * limit,
            where: {
                type: {
                    _eq: 'out'
                },
                ...variables
            }
        },
        fetchPolicy: 'cache-and-network'
    });

    // Options Filter

    const optionSmes = useMemo(() => {
        if (!dataSmes?.agencyGetSme) return [];
        return dataSmes?.agencyGetSme?.map((sme) => ({
            ...sme,
            value: sme?.sme_id,
            label: `${sme?.sme_id} - ${sme?.full_name}`,
        }));
    }, [dataSmes])

    const optionsWarehouse = useMemo(() => {
        if (!dataWarehouse) return [];
        return dataWarehouse?.smeWarehouseByAgency?.data?.map((wh) => ({
            label: wh?.name,
            value: wh?.id,
            is_default: wh?.is_default,
        }));
    }, [dataWarehouse]);

    const optionsStore = useMemo(() => {
        const stores = dataStores?.scAgencySaleStores?.data?.filter(store => {
            return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
        })?.map(store => {
            const channel = dataStores?.op_connector_channels?.find(cn => cn?.code == store?.connector_channel_code);
            return {
                ...store,
                channel,
                value: store?.id,
                label: store?.name,
                logo: channel?.logo_asset_url
            }
        })
        if (params?.ups) {
            return stores?.filter(store => params?.ups?.includes(store?.sme_id))
        }
        return stores || []
    }, [dataStores, params?.ups, dataScListConnectorStoreAgency]);

    const optionsBrand = useMemo(() => {
        if (!dataBrands) return [];
        const brands = dataBrands?.sme_brands?.map((brand) => ({
            ...brand,
            label: `${brand?.sme_id} - ${brand?.name}`,
            value: brand?.id,
        }));
        if (!!params?.ups) {
            return brands?.filter(brand => 
                params?.ups?.split(',')?.includes(String(brand?.sme_id)))
        }
        return brands || []
    }, [dataBrands, params?.ups]);

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Vận hành xuất" :"Quản lý kho"},
            { title: user?.category_code == 'fulfillment' ? "Quản lý phiếu xuất" :"Xuất kho"},
        ]);
    }, []);

    return (
        <WarehouseBillOutWrapper>
            <Helmet titleTemplate={user?.category_code == 'fulfillment' ? "Quản lý phiếu xuất" :"Xuất kho"} defaultTitle={user?.category_code == 'fulfillment' ? "Quản lý phiếu xuất" :"Xuất kho"}>
                <meta name="description" content={user?.category_code == 'fulfillment' ? "Quản lý phiếu xuất" :"Xuất kho"} />
            </Helmet>
            <Spin spinning={loadingDataWarehouseBillList}>
                <Card className="card-switch" title={false}>
                    <WarehouseBillOutListFilter
                        optionSmes={optionSmes}
                        optionsWarehouse={optionsWarehouse}
                        optionsStore={optionsStore}
                        optionsBrand={optionsBrand}
                    />
                    <WarehouseBillOutListTable 
                        dataTable={dataWarehouseBillList?.warehouseBillListWithPagination?.data}
                        dataPagination={dataWarehouseBillList?.warehouseBillListWithPagination?.meta}
                        refetch={refetch}
                        error={error}
                        optionsWarehouse={optionsWarehouse}
                        optionsStore={optionsStore}
                        optionsBrand={optionsBrand}
                    />
                </Card>
            </Spin>
        </WarehouseBillOutWrapper>
    );
};

export default WarehouseBillOutList;
