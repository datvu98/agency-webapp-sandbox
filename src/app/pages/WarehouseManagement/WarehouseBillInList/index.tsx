import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { WarehouseBillInWrapper } from "../Warehouse.styles";
import queryString from "querystring";
import dayjs from "dayjs";
import Pagination from "app/components/Pagination";
import WarehouseBillInListFilter from "./components/WarehouseBillInListFilter";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import WarehouseBillInListTable from "./components/WarehouseBillInListTable";
import query_sme_brands from "graphql/queries/query_sme_brands";
import query_smeStore from "graphql/queries/query_smeStore";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";
import client from "apollo";
import query_warehouseBillCount from "graphql/queries/query_warehouseBillCount";

const { Text } = Typography;

const queryRelateBills = async (ids) => {
	if (!ids?.length) return [];

	const { data } = await client.query({
		query: query_warehouseBillListWithPagination,
		variables: {
			limits: ids?.length,
			where: {
				id: { _in: ids },
			},
		},
		fetchPolicy: "network-only",
	});

	return data?.warehouseBillListWithPagination?.data || [];
};

const WarehouseBillInList = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const location = useLocation()
    const navigate = useNavigate();
    const { user } = useSelector(selectGlobalSlice);
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [relateBill, setRelateBill] = useState<any>([]);

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Vận hành nhập" :"Quản lý kho"},
            {
                title: "Nhập kho"
            },
        ]);
    }, []);

    const { data: dataWarehouse, loading: loadingDataWarehouse } = useQuery(query_sme_warehouse_list, {
        variables: {
            where: {
                fulfillment_by: {
                    _eq: 1,
                },
                status: {
                    _eq: 10,
                },
            },
        },
        fetchPolicy: "cache-and-network",
    });
    const { data: dataSmes } = useQuery(query_agencyGetSme, {
        fetchPolicy: "cache-and-network",
    });

    const { data: dataBrands } = useQuery(query_sme_brands, {
        fetchPolicy: "cache-and-network",
    });

    const { data: dataStores, loading: loadingDataStores } = useQuery(query_smeStore, {
        fetchPolicy: 'cache-and-network'
    });

    const optionsWarehouse = useMemo(() => {
        if (!dataWarehouse) return [];
        return dataWarehouse?.smeWarehouseByAgency?.data?.map((wh) => ({
            label: wh?.name,
            value: wh?.id,
            is_default: wh?.is_default,
        }));
    }, [dataWarehouse]);

    const optionsBrand = useMemo(() => {
        if (!dataBrands) return [];
        const brands = dataBrands?.sme_brands?.map((brand) => ({
            label: `${brand?.sme_id} - ${brand?.name}`,
            value: brand?.id,
            ...brand
        }));
        if (!!params?.ups) {
            return brands?.filter(brand => params?.ups?.split(',')?.includes(`${brand?.sme_id}`))
        }
        return brands || []
    }, [dataBrands, params?.ups]);

    const optionsStore = useMemo(() => {
        const stores = dataStores?.scAgencySaleStores?.data?.map(store => {
            const channel = dataStores?.op_connector_channels?.find(cn => cn?.code == store?.connector_channel_code);
            return {
                ...store,
                channel,
                value: store?.id,
                label: store?.name
            }
        })
        if (!!params?.ups) {
            return stores?.filter(store => params?.ups?.split(',')?.includes(`${store?.sme_id}`))
        }
        return stores || []
    }, [dataStores, params?.ups]);

    const optionSmes = useMemo(() => {
        if (!dataSmes?.agencyGetSme) return [];
        return dataSmes?.agencyGetSme?.map((sme) => ({
            ...sme,
            value: sme?.sme_id,
            label: `${sme?.sme_id} - ${sme?.full_name}`,
        }));
    }, [dataSmes]);

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

    const fulfillmentStatus = useMemo(() => {
        if(!params?.fulfillmentStatus) {
            return {}
        }
        return {
            fulfillmentStatus: {
                _in: params?.fulfillmentStatus?.split(',')
            }
        }
    }, [params?.fulfillmentStatus])

    const hasQuantityDiscrepancy = useMemo(() => {
        if(!params?.hasQuantityDiscrepancy) {
            return {}
        }
        return {
            hasQuantityDiscrepancy: {
                _eq: params?.hasQuantityDiscrepancy == 1
            }
        }
    }, [params?.hasQuantityDiscrepancy])

    // const status = useMemo(() => {
    //     if(params?.tab == 'storage_import') {
    //         return {
    //             status: {
    //                 _eq: 'storage_import'
    //             }
    //         }
    //     }
    //     if(params?.tab == 'waiting' || !params?.tab) {
    //         return {
    //             status: {
    //                 _eq: 'waiting'
    //             }
    //         }
    //     }
    //     if (params?.tab == 'complete') {
    //         if (params?.sub_tab == 'dif_after_import') {
    //             return {
    //                 status: {
    //                     _in: ['complete', 'end']
    //                 }
    //             }
    //         } else if (params?.sub_tab == 'end') {
    //             return{
    //                 status: {
    //                     _eq: 'end'
    //                 }
    //             }
    //         } else {
    //             return {
    //                 status: {
    //                     _eq: 'complete'
    //                 }
    //             }
    //         }
    //     }
    //     return {}
    // }, [params?.sub_tab, params?.tab])

    // const isPurchaseOrderCompleted = useMemo(() => {
    //     if (params?.tab == 'is_purchase_order_completed') {
    //         return {
    //             isPurchaseOrderCompleted: {
    //                 _eq: true
    //             }
    //         }
    //     }
    //     return {}
    // }, [params?.tab])

    // const isGap = useMemo(() => {
    //     if (params?.tab == 'complete' && params?.sub_tab == 'dif_after_import') {
    //         return {
    //             isGap: {
    //                 _eq: true
    //             }
    //         }
    //     }
    //     return {}
    // }, [params?.tab, params?.sub_tab])

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
                    _eq: Number(params?.protocols)
                }
            }
        }
        return {}
    }, [params?.protocols])

    const hasEvidence = useMemo(() => {
        if (params?.evidence?.length) {
            return {
                evidenceUrl: {
                    _is_null: !Boolean(+params?.evidence)
                }
            }
        }
        return {}
    }, [params?.evidence])
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

    const search = useMemo(() => {
		try {
			if (!params.q) return {};
			if (params?.search_type == "order_code") {
				return {
					orderCode: {
						_ilike: params?.q
					},
				};
			}

            if (params?.search_type == "shipping_code") {
				return {
					shippingCode: {
						_ilike: params?.q
					},
				};
			}

            if (params?.search_type == "purchase_order_code") {
				return {
					purchaseOrder: {
                        code: {
                            _ilike: params?.q
                        }
					},
				};
			}

			return {
                code: {
                    _ilike: params?.q
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
            ...hasEvidence,
            ...time,
            ...search,
            ...fulfillmentStatus,
            ...hasQuantityDiscrepancy,
            status: {
                _nin: 'new'
            }
        }
    }, [warehouseId, smeId, storeId, brandId, protocol, hasEvidence, time, search, fulfillmentStatus, hasQuantityDiscrepancy])

    const {data: dataWarehouseBillList, loading: loadingDataWarehouseBillList, error, refetch} = useQuery(query_warehouseBillListWithPagination, {
        variables: {
            limit,
            offset: (page - 1) * limit,
            where: {
                type: {
                    _eq: 'in'
                },
                ...variables
            }
        },
        fetchPolicy: 'cache-and-network'
    })

    useMemo(async () => {
		if (!dataWarehouseBillList?.warehouseBillListWithPagination?.data?.some((item) => item?.relatedWarehouseBillId)) return [];
		const ids = dataWarehouseBillList?.warehouseBillListWithPagination?.data?.filter((item) => item?.relatedWarehouseBillId)?.map((item) => item?.relatedWarehouseBillId);
		const dataRelateBills = await queryRelateBills(ids);
		setRelateBill(dataRelateBills);
	}, [dataWarehouseBillList?.warehouseBillListWithPagination]);
    return (
        <WarehouseBillInWrapper>
            <Helmet titleTemplate="Nhập kho" defaultTitle="Nhập kho">
                <meta name="description" content="Nhập kho" />
            </Helmet>
            <Spin spinning={loadingDataWarehouseBillList}>
                <Card className="card-switch" title={false}>
                    <WarehouseBillInListFilter optionSmes={optionSmes} optionsWarehouse={optionsWarehouse} optionsBrand={optionsBrand} optionsStore={optionsStore}/>
                    <WarehouseBillInListTable
                        dataTable={dataWarehouseBillList?.warehouseBillListWithPagination?.data}
                        dataPagination={dataWarehouseBillList?.warehouseBillListWithPagination?.meta}
                        refetch={refetch}
                        error={error}
                        optionSmes={optionSmes}
                        optionsWarehouse={optionsWarehouse}
                        optionSubUsers={[]}
                        relateBill={relateBill}
                        optionsStore={optionsStore}
                        optionsBrand={optionsBrand}
                    />
                </Card>
            </Spin>
        </WarehouseBillInWrapper>
    );
};

export default WarehouseBillInList;
