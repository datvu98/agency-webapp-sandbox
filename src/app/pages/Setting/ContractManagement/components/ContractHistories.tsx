import { Card, Row, Spin, Typography, Table } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import classNames from "classnames";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useParams } from "react-router-dom";
import ModalDetailHistory from "../dialogs/ModalDetailHistory";
import queryString from 'querystring'
import { useQuery } from "@apollo/client";
import query_vrCmsContractAuditHistory from "graphql/queries/query_vrCmsContractAuditHistory";
import { MAPPING_EVENT } from "../constants";
import dayjs from "dayjs";
import { ContractType } from "../types";
import Pagination from "app/components/Pagination";

const { Title, Text } = Typography;
interface ContractHistoryState {
    optionsStore?: any;
    contract: ContractType
}

interface ShowDetailType {
    show: boolean;
    dataDetail?: {
        new_values?: string,
        old_values?: string,
    };
}

const ContractHistories = () => {
    const { contractId } = useParams();
    const { appendBreadcrumb } = useLayoutContext();
    const [showDetailModal, setShowDetailModal] = useState<ShowDetailType>({
        show: false,
        dataDetail: {}
    });

    const location = useLocation();
    const state = location?.state as ContractHistoryState;
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const optionsStore = state?.optionsStore || null;
    const contract = state?.contract || {};

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: "Quản lý UpS", pathname: "/settings/smes" },
            { title: "Quản lý hợp đồng", pathname: `/settings/smes/contract-management` },
            { title: "Lịch sử hợp đồng", pathname: `/settings/smes/contract-management/history-contract/${contractId}` },
        ])
    }, []);

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

    const per_page = useMemo(() => {
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

    const {data: dataHistory, loading: loadingDataHistory, error} = useQuery(query_vrCmsContractAuditHistory, {
        variables: {
            filter: {
                page,
                per_page,
                contract_id: Number(contractId),
                sme_id: Number(params?.sme_id)
            }
        },
        fetchPolicy: 'cache-and-network'
    })

    console.log(dataHistory)

    const columns = [
        {
            title: "Tên hợp đồng",
            dataIndex: "title",
            with: 200,
            render: (record) => {
                return <Text>{contract?.title}</Text>
            }
        },
        {
            title: "Hành động",
            dataIndex: "event",
            align: "center",
            with: 100,
            render: (item, record) => {
                let eventName = MAPPING_EVENT?.[`${record?.event}`]
                let oldValue = JSON.parse(record?.old_values || '{}')
                let newValue = JSON.parse(record?.new_values || '{}')
                if (record?.event == 'updated' && oldValue?.note != newValue?.note) {
                    eventName = 'Dừng hợp đồng'
                }
                return <Text>{eventName}</Text>
            }
        },
        {
            title: "Thời gian thực hiện hành động",
            dataIndex: "created_at",
            align: "center",
            with: 200,
            render: (item, record) => {
                return <Text>{record?.created_at ? dayjs(record?.created_at).format('DD/MM/YYYY HH:mm') : '--'}</Text>
            }
        },
        {
            title: "Chi tiết",
            align: "center",
            with: 100,
            render: (_, record) => {
                let oldValue = JSON.parse(record?.old_values || '{}')
                let newValue = JSON.parse(record?.new_values || '{}')
                if ((record?.event == 'updated' && oldValue?.note != newValue?.note) || record?.event == 'created') {
                    return <></>
                }
                return <Text 
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => setShowDetailModal({
                        show: true,
                        dataDetail: {
                            old_values: record?.old_values,
                            new_values: record?.new_values
                        }
                    })}
                >
                    Xem chi tiết
                </Text>
            }
        }
    ]

    return (
        <>
            {showDetailModal?.show && <ModalDetailHistory
                show={showDetailModal?.show}
                onHide={() => setShowDetailModal({
                    show: false,
                    dataDetail: {}
                })}
                dataDetail={showDetailModal?.dataDetail}
                optionsStore={optionsStore}
            />}

            <Helmet
                titleTemplate="Lịch sử hợp đồng"
                defaultTitle="Lịch sử hợp đồng"
            >
                <meta name="description" content="Lịch sử hợp đồng" />
            </Helmet>

            <Spin spinning={loadingDataHistory}>
                <Card style={{ marginBottom: 20 }}>
                    <Row style={{ marginBottom: 16 }} >
                        <Title level={5}>Hợp đồng: {contract?.title}</Title>
                    </Row>

                    <Table
                        className="setting-table ant-upbase"
                        columns={columns as any}
                        dataSource={dataHistory?.vrCmsContractAuditHistory?.data || []}
                        bordered
                        tableLayout="auto"
                        pagination={false}
                    />
                    {!!dataHistory?.vrCmsContractAuditHistory?.data?.length && (
                        <Pagination
                            page={page}
                            totalPage={dataHistory?.vrCmsContractAuditHistory?.meta?.total_pages}
                            limit={per_page}
                            totalRecord={dataHistory?.vrCmsContractAuditHistory?.meta?.total}
                            count={dataHistory?.vrCmsContractAuditHistory?.data?.length}
                            basePath={`/settings/smes/contract-management/history-contract/${contractId}`}
                            options={[
                                { label: 25, value: 25 },
                                { label: 50, value: 50 },
                                { label: 100, value: 100 },
                            ]}
                            style={{ zIndex: 1000 }}
                        />
                    )}
                </Card>
            </Spin>
        </>
    )
};

export default ContractHistories;
