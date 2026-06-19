import React, { useMemo } from 'react';
import { Checkbox, Flex, Space, Spin, Table, Tag, Tooltip, Typography } from 'antd';
import queryString from 'querystring'
import dayjs from "dayjs";
import { useQuery } from '@apollo/client';
import { useSettlementContext } from 'app/contexts/SettlementContext';
import { formatNumberToCurrency } from 'utils/helper';
import Pagination from 'app/components/Pagination';
import { InfoCircleOutlined } from '@ant-design/icons';


const { Column, ColumnGroup } = Table;



const { Text } = Typography

const SettlementManualTable = (props: { valuesRangeTime, setValueRangeTime, ids, setIds, data, loading }) => {
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const { optionsStore } = useSettlementContext();

    const selectStore = (id: any) => optionsStore?.find((store => store.id == id))
    const checkNegativeNumber = (number) => {
        return formatNumberToCurrency(number) !== 0 ? formatNumberToCurrency(number * -1) : 0
    }
    const tab_type = useMemo(() => {
        return params?.tab || 'PENDING'
    }, [params?.tab])

    const page = useMemo(() => {
        return +params?.page || 1
    }, [params?.page])

    const perPage = useMemo(() => {
        return +params?.limit || 25
    }, [params?.limit])


    const dataTableRc = useMemo(() => {
        return props?.data?.getListSettlementOrder?.list_order?.map(order => {
            return {
                ...order,
                time: tab_type == 'PROCESSED' ? order?.payout_time : order?.completed_at
            }
        }
        )
    }, [props?.data?.getListSettlementOrder?.list_order])

    const totalRecord = props?.data?.getListSettlementOrder?.summary_data?.total_for_paging || 0
    const totalPage = Math.ceil(totalRecord / perPage)
    const summary = () => {
        const summaryData = props?.data?.getListSettlementOrder?.summary_data?.total_settlement_values
        let totalSettlementAmount = summaryData?.sum_settlement_amount || 0;
        let totalSettlementAmountEstimate = summaryData?.sum_settlement_amount_estimate || 0;
        let totalSettlementAmountAdjustment = summaryData?.sum_settlement_amount_adjustment || 0;
        let totalOriginalPrice = summaryData?.sum_original_price || 0;
        let totalSellerDiscount = summaryData?.sum_seller_discount || 0;
        let totalGiftAmount = summaryData?.sum_gift_amount || 0;
        let totalVoucherFromSeller = summaryData?.sum_voucher_from_seller || 0;
        let totalSellerCoinCashBack = summaryData?.sum_seller_coin_cash_back || 0;
        let totalSellerShippingDiscount = summaryData?.sum_seller_shipping_discount || 0;
        let totalCommissionFee = summaryData?.sum_commission_fee || 0;
        let totalPaymentFee = summaryData?.sum_payment_fee || 0;
        let totalServiceFee = summaryData?.sum_service_fee || 0;
        let totalOtherFee = summaryData?.sum_other_fee || 0;
        let totalShippingFeeAdjustment = summaryData?.sum_shipping_fee_adjustment || 0;
        let totalOtherFeeAdjustment = summaryData?.sum_other_fee_adjustment || 0;
        let totalAffiliateCommission = summaryData?.sum_affiliate_commission || 0;
        let totalSellerReturnRefund = summaryData?.sum_seller_return_refund || 0;
        let totalReverseShippingFee = summaryData?.sum_reverse_shipping_fee || 0;



        return (
            <Table.Summary fixed="bottom">
                <Table.Summary.Row style={{ textAlign: 'right' }}>
                    <Table.Summary.Cell index={1}>Tổng cộng</Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    {tab_type == 'PROCESSED' && <Table.Summary.Cell index={3}>
                        {formatNumberToCurrency(totalSettlementAmount)}đ
                    </Table.Summary.Cell>}
                    <Table.Summary.Cell index={4}>
                        {formatNumberToCurrency(totalSettlementAmountEstimate)}đ
                    </Table.Summary.Cell>
                    {tab_type == 'PROCESSED' &&
                        <Table.Summary.Cell index={1}>
                            {formatNumberToCurrency(totalSettlementAmountAdjustment)}đ
                        </Table.Summary.Cell>
                    }
                    <Table.Summary.Cell index={1}>
                        {formatNumberToCurrency(totalOriginalPrice)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalSellerDiscount)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalGiftAmount)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalVoucherFromSeller)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalSellerCoinCashBack)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalSellerShippingDiscount)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalCommissionFee)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalPaymentFee)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalServiceFee)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalOtherFee)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalShippingFeeAdjustment)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalOtherFeeAdjustment)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalAffiliateCommission)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalSellerReturnRefund)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                        {checkNegativeNumber(totalReverseShippingFee)}đ
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                </Table.Summary.Row>
            </Table.Summary>
        );
    };

    const isSelectAll = props?.ids?.length > 0 && props?.ids?.filter((x) => {
        return dataTableRc?.some((order) => order?.id === x?.id);
    })?.length == dataTableRc?.length;
    console.log(props?.ids)
    console.log(dataTableRc)
    return (
        <Spin spinning={props?.loading}>
            <Table dataSource={dataTableRc} summary={summary} pagination={false} scroll={{ x: 'max-content' }}
                sticky={{ offsetHeader: 120 }}
                className='setting-table ant-upbase'
                bordered
            >
                <Column
                    title={() => {
                        return <Flex justify='start'>
                            <Checkbox
                                checked={isSelectAll}
                                disabled={false}

                                onChange={(e) => {
                                    if (isSelectAll) {
                                        props?.setIds(
                                            props?.ids.filter((x) => {
                                                return !dataTableRc?.some(
                                                    (order) => order.id === x.id
                                                );
                                            })
                                        );
                                    } else {
                                        const tempArray = [...props?.ids];
                                        (dataTableRc || []).forEach((_returnorder) => {
                                            if (
                                                _returnorder &&
                                                !props?.ids?.some((item) => item?.id === _returnorder?.id)
                                            ) {
                                                tempArray.push(_returnorder);
                                            }
                                        });
                                        props?.setIds(tempArray);
                                    }
                                }}
                            />
                            <Text style={{ marginLeft: 10 }}>Mã đơn hàng</Text>
                        </Flex>
                    }}
                    width={150}
                    dataIndex="order_id"
                    key="order_id"
                    render={(item, record: any) => {
                        console.log(record)
                        return (
                            <Flex align='center'>
                                <Checkbox
                                    disabled={false}
                                    // inputProps={{
                                    //   "aria-label": "checkbox",
                                    // }}
                                    checked={props?.ids.some((_id) => _id.id == record.id)}
                                    onChange={(e) => {
                                        if (props?.ids.some((_id) => _id.id == record.id)) {
                                            props?.setIds((prev) =>
                                                prev.filter((_id) => _id.id != record.id)
                                            );
                                        } else {
                                            props?.setIds((prev) => prev.concat([record]));
                                        }
                                    }}
                                />
                                <span style={{ color: 'black', marginLeft: 4 }}>{record?.order_ref_id}</span>
                            </Flex>
                        )
                    }}
                    align='left'
                />
                <Column
                    title="Gian hàng"
                    dataIndex="store"
                    key="store"
                    width={150}
                    render={(item, record: any) => {
                        return <Flex align='center'>
                            <span><img style={{ width: '20px', height: '20px', marginRight: '4px' }} src={selectStore(record?.store_id)?.channel?.logo_asset_url}></img></span>
                            <span style={{ color: 'black' }}>{selectStore(record?.store_id)?.name}</span>
                        </Flex>
                    }}
                    align='left'
                />
                {params?.tab == 'PROCESSED' && <Column
                    title={<>
                        <Text>Số tiền đã quyết toán</Text>
                        <Tooltip title={"Số tiền đã quyết toán về ví."}>
                            <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                        </Tooltip>
                    </>}
                    dataIndex="settlement_amount"
                    key="settlement_amount"
                    width={150}
                    render={(item, record) => {
                        return (
                            <div style={{ color: 'black' }}>
                                {formatNumberToCurrency(item)}đ
                            </div>
                        )
                    }}
                    align='right'
                />}
                <Column
                    title={<>
                        <Text>Số tiền quyết toán ước tính</Text>
                        <Tooltip title={"Số tiền thanh toán ước tính = Giá gốc + Trợ giá và giảm giá từ người bán - phí nền tảng - Chênh lệch - Hoa hồng liên kết - Hoàn tiền."}>
                            <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                        </Tooltip>
                    </>}
                    dataIndex="settlement_amount_estimate"
                    key="settlement_amount_estimate"
                    width={150}
                    render={(item, record) => {
                        return (
                            <div style={{ color: 'black' }}>
                                {formatNumberToCurrency(item)}đ
                            </div>
                        )
                    }}
                    align='right'
                />
                {params?.tab == 'PROCESSED' && (
                    <Column
                        title={<>
                            <Text>Số tiền chênh lệch</Text>
                            <Tooltip title={"Số tiền chênh lệch = Số tiền đã quyết toán - Số tiền quyết toán ước tính."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="settlement_amount_adjustment"
                        key="settlement_amount_adjustment"
                        width={150}
                        render={(item, record) => {
                            return (
                                <div style={{ color: 'black' }}>
                                    {formatNumberToCurrency(item)}đ
                                </div>
                            )
                        }}
                        align='right'
                    />)}
                <Column
                    title={<>
                        <Text>Giá gốc</Text>
                        <Tooltip title={"Giá đăng bán của sản phẩm."}>
                            <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                        </Tooltip>
                    </>}
                    dataIndex="original_price"
                    key="original_price"
                    width={150}
                    render={(item, record) => {
                        return <div style={{ color: 'black' }}>
                            {formatNumberToCurrency(item)}đ
                        </div>
                    }}
                    align='right'
                />

                <ColumnGroup title="Trợ phí và giảm giá từ người bán">
                    <Column
                        title={<>
                            <Text>Trợ giá sản phẩm</Text>
                            <Tooltip title={"Người bán trợ giá sản phẩm."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="seller_discount"
                        key="seller_discount"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                    <Column
                        title="Chi phí quà tặng"
                        dataIndex="gift_amount"
                        key="gift_amount"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                    <Column
                        title={<>
                            <Text>Mã giảm giá</Text>
                            <Tooltip title={"Giảm giá từ voucher người bán."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="voucher_from_seller"
                        key="voucher_from_seller"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                    <Column
                        title={<>
                            <Text>Người bán hoàn xu</Text>
                            <Tooltip title={"Số tiền người bán chi trả để hoàn xu cho người mua."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="seller_coin_cash_back"
                        key="seller_coin_cash_back"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                </ColumnGroup>

                <ColumnGroup title="Phí nền tảng">
                    <Column
                        title={<>
                            <Text>Người bán hỗ trợ vận chuyển</Text>
                            <Tooltip title={"Số tiền nhà bán trợ giá vận chuyển cho người mua."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="seller_shipping_discount"
                        key="seller_shipping_discount"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                    <Column
                        title={<>
                            <Text>Phí cố định</Text>
                            <Tooltip title={"Đối với shopee, phí giao dịch = Phí cố định + Phí thanh toán"}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="commission_fee"
                        key="commission_fee"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                    <Column
                        title="Phí thanh toán"
                        dataIndex="payment_fee"
                        key="payment_fee"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                    <Column
                        title={<>
                            <Text>Phí dịch vụ</Text>
                            <Tooltip title={"Phí dịch vụ nền tảng thu của người bán."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="service_fee"
                        key="service_fee"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                    <Column
                        title={<>
                            <Text>Phí khác</Text>
                            <Tooltip title={"Chi phí khác phát sinh từ nền tảng."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="other_fee"
                        key="other_fee"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                </ColumnGroup>
                <ColumnGroup title="Chênh lệch">
                    <Column
                        title={<>
                            <Text>Vận chuyển</Text>
                            <Tooltip title={"Chênh lệch vận chuyển = Phí vận chuyển người mua trả - phí vận chuyển thực tế."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="shipping_fee_adjustment"
                        key="shipping_fee_adjustment"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                    <Column
                        title={<>
                            <Text>Khác</Text>
                            <Tooltip title={"Các khoản chênh lệch khác phát sinh từ nền tảng."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="other_fee_adjustment"
                        key="other_fee_adjustment"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                </ColumnGroup>
                <Column
                    title={<>
                        <Text>Hoa hồng liên kết</Text>
                        <Tooltip title={"Khoản hoa hồng mà người bán cần trả cho đối tác tiếp thị liên kết."}>
                            <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                        </Tooltip>
                    </>}
                    dataIndex="affiliate_commission"
                    key="affiliate_commission"
                    width={150}
                    render={(item, record) => {
                        return <div style={{ color: 'black' }}>
                            {checkNegativeNumber(item)}đ
                        </div>
                    }}
                    align='right'
                />
                <ColumnGroup title="Hoàn tiền">
                    <Column
                        title={<>
                            <Text>Hoàn tiền người mua</Text>
                            <Tooltip title={"Người bán hoàn trả lại tiền = Tiền người bán hoàn trả lại cho người mua + Số tiền mà sàn trợ giá."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="seller_return_refund"
                        key="seller_return_refund"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                    <Column
                        title={<>
                            <Text>Phí trả hàng</Text>
                            <Tooltip title={"Người bán hoàn trả lại tiền = Tiền người bán hoàn trả lại cho người mua + Số tiền mà sàn trợ giá."}>
                                <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                            </Tooltip>
                        </>}
                        dataIndex="reverse_shipping_fee"
                        key="reverse_shipping_fee"
                        width={150}
                        render={(item, record) => {
                            return <div style={{ color: 'black' }}>
                                {checkNegativeNumber(item)}đ
                            </div>
                        }}
                        align='right'
                    />
                </ColumnGroup>
                <Column
                    title={<>
                        <Text>{params?.tab != 'PROCESSED' ? "Thời gian đơn hàng hoàn thành" : "Thời gian quyết toán"}</Text>
                        <Tooltip title={params?.tab == 'PROCESSED' ? "Thời gian đơn hàng được quyết toán về ví." : "Thời gian đơn hàng được người mua xác nhận đã nhận được hàng."}>
                            <InfoCircleOutlined style={{ verticalAlign: '-2px !important', marginLeft: 4 }} />
                        </Tooltip>
                    </>}
                    dataIndex="time"
                    key="time"
                    width={150}
                    render={(item) => {
                        return (
                            <div style={{ color: 'black' }}>{!!item ? dayjs(item * 1000).format("DD/MM/YYYY[\n]HH:mm") : ''}</div>
                        )
                    }}
                    align='right'
                />
            </Table>
            {!props?.loading && <Pagination
                page={page}
                totalPage={totalPage}
                loading={props?.loading}
                limit={perPage}
                totalRecord={totalRecord}
                count={props?.data?.getListSettlementOrder?.list_order?.length}
                basePath={'/settlement-manage/manual'}
                emptyTitle={'Không có bản ghi nào'}
            />}
        </Spin>
    )
};

export default SettlementManualTable;