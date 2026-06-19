import React, { memo } from "react";
import { Modal, Button, Flex, Typography, Table, Empty } from "antd";
import { useQuery } from "@apollo/client";
import query_processingListShowLocationWarehouseBill from "graphql/queries/query_processingListShowLocationWarehouseBill";
import { formatNumberToCurrency } from "utils/helper";
import dayjs from "dayjs";

interface ModalDetailLocationWhBillProps {
    show: boolean;
    onHide: () => void;
    dataInfo: {
        id: number,
        warehouseBillId: string
    }
}
const {Text} = Typography

const ModalDetailLocationWhBill: React.FC<ModalDetailLocationWhBillProps> = memo(({ show, onHide, dataInfo }) => {
    const {data: dataDetailLocation, loading: loadingDataDetailLocation} = useQuery(query_processingListShowLocationWarehouseBill, {
        variables: {
            id: dataInfo?.id,
            warehouseBillId: dataInfo?.warehouseBillId
        },
        fetchPolicy: 'cache-and-network',
    })
    const columns = [
        {
            title: 'Mã vị trí',
            dataIndex: 'storageEquipmentCode',
            key: 'storageEquipmentCode',
            width: '25%',
            align: 'left',
            render: (item, record) => {
                return <Text>{record?.storageEquipmentCode || '--'}</Text>
            }
        },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expiredAt',
            key: 'expiredAt',
            width: '25%',
            render: (item, record) => {
                return <span>{record?.expiredAt ? dayjs(record?.expiredAt).format('DD/MM/YYYY') : '--'}</span>
            }
        },
        {
            title: 'Mã lô',
            dataIndex: 'lotNumber',
            key: 'lotNumber',
            width: '25%',
            render: (item, record) => {
                return <span>{record?.lotNumber || '--'}</span>
            }
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '25%',
            align: 'right',
            render: (item, record) => {
                return <span>{formatNumberToCurrency(record?.quantity)}</span>
            }
        },
    ];
    return (
        <Modal open={show} centered footer={null} onCancel={onHide} destroyOnClose width={1000} title='Thông tin vị trí'>
           <div style={{ textAlign: "center", padding: "16px 8px" }}>
            <Table
                className="upbase-table"
                columns={columns as any}
                bordered
                loading={loadingDataDetailLocation}
                
                locale={{
                    emptyText: <Flex className="empty-table" vertical justify="center" align="center">
                        <Empty className="icon-empty-table" description={false} />
                        <Text>Chưa có thông tin vị trí</Text>
                    </Flex>
                }}
                pagination={false}
                dataSource={dataDetailLocation?.processingListShowLocationWarehouseBill?.data || []}
                tableLayout="auto"
                scroll={{ x: 'max-content' }}
            />
            </div>
        </Modal>
    );
});

export default ModalDetailLocationWhBill;
