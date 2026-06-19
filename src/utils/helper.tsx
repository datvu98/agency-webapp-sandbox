import client from 'apollo';
import { selectGlobalSlice } from 'app/slice/selectors';
import mutate_coCheckRepOrderIdExist from 'graphql/mutations/mutate_coCheckRepOrderIdExist';
import React from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const optionAlert = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: 0,
    theme: 'colored'
} as any;

export const toAbsoluteUrl = pathname => process.env.PUBLIC_URL + pathname;

export const showAlert = {
    success: (mess) => {
        toast.success(
            <p style={{ fontSize: 14, margin: 0 }}>{mess}</p>,
            optionAlert
        );
    },
    warn: (mess) => {
        toast.warn(
            <p style={{ fontSize: 14, margin: 0 }}>{mess}</p>,
            optionAlert
        );
    },
    error: (mess) => {
        toast.error(
            <p style={{ fontSize: 14, margin: 0 }}>{mess}</p>,
            optionAlert
        );
    },
    info: (mess) => {
        toast.info(
            <p style={{ fontSize: 14, margin: 0 }}>{mess}</p>,
            optionAlert
        );
    }
};

export const randomString = () => {
    return uuidv4();
}

export const hasPermissionAction = (keys: any = [], permissions: any = []) => {
    return true
}

export const formatNumberToCurrency = (n: any = 0, toFixed = 2) => {
    if (!n) {
        return 0;
    }
    let reg = /(\d)(?=(\d{3})+(?:\.\d+)?$)/g

    let number = parseFloat(n).toFixed(toFixed) as any;
    if (parseInt(n) - number == 0) {
        number = parseInt(n)
    }

    return number.toString().replace(reg, '$&,');
}

export const STATUS_ORDER_DETAIL = {
    "CREATED": 'Đơn hàng mới',
    "PENDING": 'Chờ duyệt',
    "pending": 'Chờ đóng gói',
    "packed": 'Chờ lấy hàng',
    "packing": 'Đang đóng gói',
    "creating": 'Đang tạo vận đơn',
    "SHIPPED": 'Đã giao cho ĐVVC',
    "RETRY_SHIP": 'Giao hàng lại',
    "FAILED_DELIVERY": 'Giao hàng thất bại',
    "COMPLETED": 'Hoàn thành',
    "CANCELLED": 'Hủy',
    "OTHER": 'Khác',
    "pack_error": 'Chuẩn bị hàng lỗi',
    "pack_lack": 'Thiếu hàng',
    "TO_CONFIRM_RECEIVE": 'Đã giao cho người mua'
};

export const renderStatusName = (order) => {
    let order_status = order?.status;
    if (order_status == 'READY_TO_SHIP' && order?.logisticsPackages?.filter(item => item.pack_status == 'pending').length > 0) {
        order_status = 'pending'
    }

    if (order_status == 'READY_TO_SHIP' && order?.logisticsPackages?.filter(item => item.pack_status == 'pack_error').length > 0) {
        order_status = 'pack_error'
    }

    if (order_status == 'PROCESSED' && order?.logisticsPackages?.filter(item => item.pack_status == 'creating').length > 0) {
        order_status = 'creating'
    }

    if (order_status == 'PROCESSED' && order?.logisticsPackages?.filter(item => item.pack_status == 'packing').length > 0) {
        order_status = 'packing'
    }

    if (order_status == 'PROCESSED' && order?.logisticsPackages?.filter(item => item.pack_status == 'packed').length > 0) {
        order_status = 'packed'
    }

    if (order_status == 'READY_TO_SHIP' && order?.logisticsPackages?.filter(item => item.pack_status == 'pack_lack').length > 0) {
        order_status = 'pack_lack'
    }

    let status = STATUS_ORDER_DETAIL[order_status] || 'Khác';

    if (status == 'Khác') {
        order_status = "Other"
    }

    return { status, order_status };
};

export const queryCheckRepOrderIdExist = async (value) => {
    let { data } = await client.mutate({
        mutation: mutate_coCheckRepOrderIdExist,
        fetchPolicy: 'network-only',
        variables: {
            ref_id: value
        }
    })
    return data?.coCheckRepOrderIdExist?.count_exists > 0;
}

export const changePositionConversation = (array, fromIndex, toIndex) => {
    const element = array.splice(fromIndex, 1)[0];
    array.splice(toIndex, 0, element);

    return array;
}

export const printFromS3 = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
  
    return new Promise<void>((resolve) => {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = blobUrl;
  
      document.body.appendChild(iframe);
  
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
  
        resolve();
      };
    });
};