import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client';
import { useLocation } from "react-router-dom";
import queryString from "querystring";
import Pagination from 'app/components/Pagination';
import query_cfGetJobTrackingExport from 'graphql/queries/query_cfGetJobTrackingExport';
import query_smeStore from 'graphql/queries/query_smeStore';
import { Button, Flex, Spin } from 'antd';
import { WarningTwoTone } from '@ant-design/icons';
import RowTable from './RowTable';

const Table = () => {
    const [timePoll, setTimePoll] = useState(1000)
    const params = queryString.parse(useLocation().search.slice(1, 100000));

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
    }, [params.limit]);

    const { data, error, loading, refetch } = useQuery(query_cfGetJobTrackingExport, {
        variables: {
            page,
            per_page: limit,
            type: 2
        },
        fetchPolicy: 'cache-and-network',
        pollInterval: timePoll
    });

    useMemo(() => {
        const WAITING_STATUS = 0
        const status = data?.cfGetJobTrackingExport?.job_tracking_export?.map(item => item.status) || []
        status?.includes(WAITING_STATUS) ? setTimePoll(1000) : setTimePoll(0)
    }, [data])

    const { data: dataStore, loading: loadingStore } = useQuery(query_smeStore, { fetchPolicy: "cache-and-network" });
    const channels = dataStore?.op_connector_channels || []
    let totalRecord = data?.cfGetJobTrackingExport?.total || 0;
    let totalPage = Math.ceil(totalRecord / limit);


    return (
        <>
            <table className="table table-borderless product-list table-vertical-center">
                <thead
                    style={{
                        position: "sticky",
                        top: 41,
                        zIndex: 31,
                        background: "#F3F6F9",
                        fontWeight: "bold",
                        fontSize: "14px",
                        borderRight: "1px solid #d9d9d9",
                        borderBottom: "1px solid #d9d9d9",
                        borderLeft: "1px solid #d9d9d9",
                        borderTop: "1px solid #d9d9d9",
                    }}
                >
                    <tr className="font-size-lg">
                        <th style={{ fontSize: "14px", width: "200px", textAlign: 'center' }} >
                            Gian hàng
                        </th>
                        <th style={{ fontSize: "14px", width: "140px", textAlign: 'left' }} >
                            Thời gian đơn hoàn thành
                        </th>
                        <th style={{ fontSize: "14px", width: "150px", textAlign: 'center' }} >
                            Số lượng phiếu
                        </th>
                        <th style={{ fontSize: "14px", width: "140px", textAlign: 'center' }}>
                            Thời gian yêu cầu
                        </th>
                        <th style={{ fontSize: "14px", width: "150px", textAlign: 'center' }} >
                            Trạng thái xuất file
                        </th>
                        <th style={{ fontSize: "14px", width: "150px", textAlign: 'center' }} >
                            Thao tác
                        </th>

                    </tr>
                </thead>
                <tbody
                    style={{
                        borderLeft: "1px solid #d9d9d9",
                        borderRight: "1px solid #d9d9d9",
                    }}
                >
                    {loading && (
                        <div
                            style={{ position: "absolute", textAlign: 'center', width: '100%', marginTop: 8 }}
                        >
                            <Spin spinning={true}></Spin>
                        </div>
                    )}
                    {!!error && !loading && (
                        <div
                            style={{ position: "absolute", textAlign: 'center', marginTop: 16 }}
                        >
                            <Flex align='center' justify='center'>
                                <WarningTwoTone style={{ fontSize: 48, marginBottom: 8, color: 'red' }} />
                                <p style={{ marginBottom: 12 }}>Xảy ra lỗi trong quá trình tải dữ liệu</p>
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        refetch();
                                    }}
                                    type="primary"
                                    color="#ff5629"
                                    style={{ height: 38, fontSize: 14, width: 100, color: 'white' }}
                                >
                                    Tải lại
                                </Button>
                            </Flex>
                        </div>
                    )}

                    {(data?.cfGetJobTrackingExport?.job_tracking_export || [])?.map((item, index) => (
                        <RowTable channels={channels} item={item} key={index} />
                    ))}
                </tbody>
            </table>
            {!error && (
                <Pagination
                    page={page}
                    totalPage={totalPage}
                    loading={loading}
                    limit={limit}
                    totalRecord={totalRecord}
                    count={data?.cfGetJobTrackingExport?.job_tracking_export?.length}
                    basePath={"/settlement-manage/exportfile-settlement-processed"}
                    emptyTitle={"Không có dữ liệu"}
                />
            )}
        </>
    )
}

export default Table