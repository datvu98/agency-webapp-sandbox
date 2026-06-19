import React, { useCallback, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { saveAs } from "file-saver";
import { useMutation } from '@apollo/client'
import { formatNumberToCurrency, showAlert } from 'utils/helper';
import mutate_cfRetryExportSettlement from 'graphql/mutations/mutate_cfRetryExportSettlement';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';

const { Text } = Typography;

const RowTable = ({ channels, item }) => {
    const [showAll, setShowAll] = useState(false)

    const [timeFrom, timeTo, listStore] = useMemo(() => {

        const { time_from, time_to, list_store } = !!item?.params_payload ? JSON.parse(item?.params_payload) : { time_from: null, time_to: null, list_store: null }

        return [time_from, time_to, list_store]
    }, [item])

    const viewStores = useMemo(() => {

        if (listStore?.length == 0 || !listStore) {
            return "N/A"
        }
        const stores = listStore?.map((store, idx) => {
            let channel = channels?.find(channel => channel.code == store.connector_channel_code)

            return {
                ...store,
                logo: channel?.logo_asset_url,
                name: store?.name_store
            }
        })
        const viewStore = stores?.map(store => (
            <div key={store?.id} style={{ marginTop: 4, marginBottom: 4 }}>
                <img src={store?.logo} style={{ width: 20, height: 20, marginRight: 8 }} alt='' />
                <span>{store?.name}</span>
            </div>
        ))
        if (stores?.length == 1) {
            return viewStore
        }
        if (stores?.length > 1 && !showAll) {
            return (
                <>
                    <div style={{ marginTop: 4, marginBottom: 4 }} > <FileTextOutlined /> Nhiều gian hàng</div>
                    <span style={{ color: '#ff5629' }} role='button' onClick={e => { setShowAll(true) }}>Xem thêm</span>
                </>
            )
        }
        return (
            <>
                {viewStore}
                <span style={{ color: '#ff5629' }} role='button' onClick={e => setShowAll(false)}>
                    Thu gọn
                </span>
            </>
        )

    }, [item, showAll, channels])


    const STATUS_CODE = {
        WAITING: 0,
        DONE: 1,
        FAILED: 2,
    }

    const status = {
        [STATUS_CODE.WAITING]: "Đang xử lý",
        [STATUS_CODE.DONE]: "Thành công",
        [STATUS_CODE.FAILED]: "Thất bại",
    }

    const dowloadFile = useCallback(() => {
        fetch(item?.link_file_export).then((response) => {
            response.blob().then((blob) => {
                const fileURL = window.URL.createObjectURL(blob)
                let alink = document.createElement("a");
                alink.href = fileURL;
                alink.download = item?.file_name;
                alink.click();
            });
        });
    }, [item])


    const [cfRetryExportSettlement, { loading: retryLoading }] = useMutation(
        mutate_cfRetryExportSettlement, {
        variables: { id: item.id },
        onCompleted: (data) => {
            if (!!data?.cfRetryExportSettlement?.success) {
                showAlert.success(data?.cfRetryExportSettlement.message || '');
                return
            }
            showAlert.error(data?.cfRetryExportSettlement.message || 'Có lỗi xảy ra');
        }
    });
    return (
        <tr>
            <td>
                <Flex vertical>
                    {viewStores}
                </Flex>
            </td>
            <td className={item.id}>{`Từ ${timeFrom ? dayjs(timeFrom * 1000).format("DD/MM/YYYY") : 'Invalid Date'} đến ${timeTo ? dayjs(timeTo * 1000).format("DD/MM/YYYY") : 'Invalid Date'}`}</td>
            <td style={{ textAlign: 'center' }}>{formatNumberToCurrency(item?.total_order_settlement)}</td>
            <td style={{ textAlign: 'center' }}>{item?.updated_at ? dayjs(item?.created_at).format("DD/MM/YYYY HH:mm") : ''}</td>
            <td style={{ textAlign: 'center' }}>{status[item?.status]}</td>
            <td style={{ textAlign: 'center' }}>
                {item?.status == STATUS_CODE.DONE ? (
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        dowloadFile()
                    }} type="primary"
                        color="#ff5629"
                        style={{ height: 36, fontSize: 14, color: 'white' }}>
                        <Flex gap={4} align='center'>
                            <DownloadOutlined />
                            <Text style={{ color: 'white' }}>Tải file</Text>
                        </Flex>
                    </Button>
                ) :
                    item?.status == STATUS_CODE.FAILED ?
                        retryLoading ? <span className="spinner spinner-primary"></span> :
                            <span role="button" className='text-primary' onClick={async () => { await cfRetryExportSettlement() }}>Thử lại</span> : ''}
            </td>
        </tr>
    )
}

export default RowTable