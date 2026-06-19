import { useQuery } from "@apollo/client";
import { map, sum } from 'lodash';
import { Table, Modal, Checkbox, Flex, Typography, Button, Spin, Input, Empty } from 'antd';
import 'rc-table/assets/index.css';
import React, { Fragment, memo, useCallback, useMemo, useState } from 'react';
import { useCreateOrderContext } from "app/contexts/CreateOrderContext";
import query_crmSearchRecipientAddressByCustomer from "graphql/queries/query_crmSearchRecipientAddressByCustomer";
import classNames from "classnames";
import styled from "styled-components";
import { SearchOutlined } from "@ant-design/icons";
// import { toAbsoluteUrl } from '../../../../../_metronic/_helpers';
// import InfoProduct from '../../../../../components/InfoProduct';
// import Pagination from '../../../../../components/PaginationModal';
// import { formatNumberToCurrency } from '../../../../../utils';
// import ModalCombo from "../../../Products/products-list/dialog/ModalCombo";
// import query_crmGetCustomers from "../../../../../graphql/query_crmGetCustomers";
// import ClampLines from "react-clamp-lines";
// import query_crmRecipientAddressByCustomer from "../../../../../graphql/query_crmRecipientAddressByCustomer";
// import { useOrderManualContext } from "../OrderManualContext";
// import query_crmSearchRecipientAddressByCustomer from "../../../../../graphql/query_crmSearchRecipientAddressByCustomer";

const { Text, Paragraph } = Typography;

const ModalWrapper = styled(Modal)`    
    .ant-modal-body {
        margin: 20px 0px;
    }

    .input-wrapper {
        width: 50%;
        height: 35px;
    }
`;

const ModalReceiver = ({
    show,
    onHide,
    onSelectReceiver,
}) => {
    const { optionsProvince, optionsDistrict, infoCustomer, infoReceiver } = useCreateOrderContext();
    const [selectedRowKeys, setSelectedRowKey] = useState<any>([]);
    const [search, setSearch] = useState<any>({
        searchText: '',
        searchType: '',
        page: 1,
        limit: 10,
    });

    const { loading: loadingRecipientAddressByCustomer, data: dataRecipientAddressByCustomer } = useQuery(query_crmSearchRecipientAddressByCustomer, {
        fetchPolicy: "cache-and-network",
        variables: {
            search: {
                q: search?.searchText,
                crm_customer_id: Number(infoCustomer?.id),
            },
            per_page: Number(search.limit),
            page: search.page,
        },
        skip: !infoCustomer?.id
    });

    console.log({ infoReceiver, selectedRowKeys })

    useMemo(() => {
        !!infoReceiver && setSelectedRowKey([infoReceiver]);
    }, [infoReceiver]);

    const onResetData = useCallback(() => {
        setSearch({
            searchText: null,
            searchType: '',
            page: 1,
            limit: 10,
        })
        setSelectedRowKey([]);
        onHide();
    }, []);

    const columns = [
        {
            title: 'Tên người nhận',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return <Text>{item || '--'}</Text>
            }
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return <span>{item || '--'}</span>
            }
        },
        {
            title: 'Tỉnh/Thành phố',
            dataIndex: 'province_code',
            key: 'province_code',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                const province = optionsProvince?.find(pr => pr?.value == item)?.label;
                return <span>{province || '--'}</span>
            }
        },
        {
            title: 'Quận/Huyện',
            dataIndex: 'district_code',
            key: 'district_code',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                const district = optionsDistrict[record?.province_code]?.find(dt => dt?.value == item)?.label;
                return <span>{district || '--'}</span>
            }
        },
        {
            title: 'Địa chỉ đầy đủ',
            dataIndex: 'address',
            key: 'address',
            width: '20%',
            fixed: 'left',
            align: 'left',
            render: (item, record) => {
                return <div>
                    <Paragraph
                        style={{ margin: 0 }}
                        ellipsis={{
                            rows: 2,
                            expandable: 'collapsible',
                            tooltip: item,
                            symbol: (expanded) => expanded ? 'Thu gọn' : 'Xem thêm'
                        }}
                    >
                        {item}
                    </Paragraph>
                </div>
            }
        },
    ];

    const rowSelection = {
        selectedRowKeys: selectedRowKeys?.map(item => item?.key),
        onChange: (_selectedRowKeys: React.Key[], selectedRows: any) => {
            setSelectedRowKey([selectedRows[selectedRows?.length - 1]]);
        },
    };

    return (
        <ModalWrapper
            open={show}
            title="Chọn thông tin người nhận"
            closable={false}
            width={950}
            centered
            footer={[
                <Flex align="center" justify="flex-end">
                    <Flex align="center" gap={20}>
                        <Button
                            type="primary"
                            className="btn-base btn-cancel"
                            onClick={onResetData}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            className="btn-base"
                            disabled={!infoCustomer || selectedRowKeys?.length == 0}
                            onClick={() => {
                                onSelectReceiver(selectedRowKeys[0]);
                                onResetData();
                            }}
                        >
                            Xác nhận
                        </Button>
                    </Flex>
                </Flex>
            ]}
        >
            <Spin spinning={false}>
                <Flex vertical gap={20}>
                    <Input
                        className="input-wrapper"
                        placeholder="Tìm kiếm tên người nhận, sđt, ..."
                        prefix={<SearchOutlined />}
                        onBlur={(e) => {
                            setSearch({ ...search, searchText: e.target.value, page: 1 })
                        }}
                        onKeyDown={(e: any) => {
                            if (e.keyCode == 13) {
                                setSearch({ ...search, searchText: e.target.value, page: 1 })
                            }
                        }}
                    />
                    <Table
                        className="upbase-table"
                        columns={columns as any}
                        bordered
                        loading={loadingRecipientAddressByCustomer}
                        rowSelection={{
                            hideSelectAll: true,
                            type: 'checkbox',
                            ...rowSelection,
                        }}
                        locale={{
                            emptyText: <Flex className="empty-table" vertical justify="center" align="center">
                                <Empty className="icon-empty-table" description={false} />
                                {!!infoCustomer ? <Text>Chưa có thông tin người nhận</Text> : <Text>Chưa có thông tin người mua</Text>}
                            </Flex>
                        }}
                        dataSource={dataRecipientAddressByCustomer?.crmSearchRecipientAddressByCustomer?.customer_address?.map(item => ({ ...item, key: item?.id })) || []}
                        pagination={{
                            size: 'default',
                            pageSize: search?.limit,
                            total: dataRecipientAddressByCustomer?.crmSearchRecipientAddressByCustomer?.total || 0,
                            current: search?.page,
                            showTotal: (total: any) => <Text>Tổng số {total}</Text>,
                        }}
                        tableLayout="auto"
                        scroll={{ y: 350 }}
                        sticky={{ offsetHeader: 0 }}
                    />
                </Flex>
            </Spin>
        </ModalWrapper>
    )

    // return (
    //     <Fragment>
    //         <Modal
    //             open={false}                                
    //             centered                
    //         >
    //             <Modal closeButton={true}>
    //                 <Modal.Title>
    //                     {'Chọn thông tin người nhận'}
    //                 </Modal.Title>
    //             </Modal.Header>
    //             <Modal.Body className="overlay overlay-block cursor-default pb-0">
    //                 <div className='row mb-4'>
    //                     <div className="col-6 input-icon" >
    //                         <input
    //                             type="text"
    //                             className="form-control"
    //                             placeholder={"Tìm kiếm tên khách hàng, sđt, …"}
    //                             style={{ height: 40 }}
    //                             onBlur={(e) => {
    //                                 setSearch({ ...search, searchText: e.target.value, page: 1 })
    //                             }}
    //                             onKeyDown={e => {
    //                                 if (e.keyCode == 13) {
    //                                     setSearch({ ...search, searchText: e.target.value, page: 1 })
    //                                 }
    //                             }}
    //                         />
    //                         <span><i className="flaticon2-search-1 icon-md ml-6" style={{ position: 'absolute', top: 20 }}></i></span>
    //                     </div>
    //                 </div>
    //                 <div>
    //                     <div style={{ position: 'relative' }}>
    //                         {loadingRecipientAddressByCustomer && (
    //                             <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 99 }}>
    //                                 <span className="spinner spinner-primary" />
    //                             </div>
    //                         )}
    //                         <Table
    //                             style={loadingRecipientAddressByCustomer ? { opacity: 0.4 } : {}}
    //                             className="upbase-table"
    //                             columns={columns as any}
    //                             dataSource={dataRecipientAddressByCustomer?.crmSearchRecipientAddressByCustomer?.customer_address || []}
    //                             emptyText={<div className='d-flex flex-column align-items-center justify-content-center my-10'>
    //                                 <img src={toAbsoluteUrl("/media/empty.png")} alt="image" width={80} />
    //                                 <span className='mt-4'>
    //                                     {!!idCustomer ? 'Chưa có thông tin người nhận' }) : 'Chưa có dữ liệu. Vui lòng chọn thông tin người mua'}
    //                                 </span>
    //                             </div>}
    //                             tableLayout="auto"
    //                             scroll={{ y: 350 }}
    //                             sticky={{ offsetHeader: 0 }}
    //                         />
    //                     </div>
    //                     {dataRecipientAddressByCustomer?.crmSearchRecipientAddressByCustomer?.total > 0 && (
    //                         <div style={{ marginLeft: '-0.75rem', marginRight: '-0.75rem' }}>
    //                             <Pagination
    //                                 page={search.page}
    //                                 totalPage={totalPage}
    //                                 loading={loadingRecipientAddressByCustomer}
    //                                 isAddOrder={true}
    //                                 quickAdd={true}
    //                                 limit={search.limit}
    //                                 totalRecord={totalRecord}
    //                                 count={dataRecipientAddressByCustomer?.crmSearchRecipientAddressByCustomer?.customer_address?.length}
    //                                 onPanigate={(page) => setSearch({ ...search, page: page })}                                    
    //                                 emptyTitle={'Chưa có thông tin người nhận'}
    //                             />
    //                         </div>
    //                     )}
    //                 </div>
    //             </Modal.Body>
    //             <Modal.Footer className="form" style={{ borderTop: '1px solid #dbdbdb', justifyContent: 'end', paddingTop: 10, paddingBottom: 10 }} >
    //                 <div className="form-group">
    //                     <button
    //                         type="button"
    //                         onClick={onResetData}
    //                         className="btn btn-secondary mr-4"
    //                         style={{ width: 120 }}
    //                     >
    //                         {'Hủy bỏ'}
    //                     </button>
    //                     <button
    //                         type="button"
    //                         className={`btn ${(!customerSelected || !idCustomer) ? 'btn-darkk' : 'btn-primary'}`}
    //                         disabled={!customerSelected || !idCustomer}
    //                         style={{ width: 120, cursor: (!customerSelected || !idCustomer) ? 'not-allowed' : 'pointer' }}
    //                         onClick={() => {
    //                             onSelectReceiver(customerSelected);
    //                             onResetData();
    //                         }}
    //                     >
    //                         {'Xác nhận'}
    //                     </button>
    //                 </div>
    //             </Modal.Footer>
    //         </Modal>
    //     </Fragment>
    // )
};

export default memo(ModalReceiver);