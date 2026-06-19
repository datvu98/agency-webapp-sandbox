import React, { useEffect, useMemo, useRef, useState } from 'react'
import usePartnerConnect from '../hooks/usePartnerConnect'
import queryString from 'querystring'
import { showAlert } from 'utils/helper'
import { Modal, Spin, Typography, Button, Space } from 'antd'
import { CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { useLocation, useParams } from 'react-router-dom'

const { Text } = Typography

const ModalAddAccountRedirect = ({ show, onHide }) => {
    const [error, setError] = useState('')
    const processedSuccessRef = useRef(false)
    const { 
        dataGrantAuthorization, 
        loadingGrantAuthorization,
        handleGrantAuthorization,
        handleReconnectPartnerAccount
    } = usePartnerConnect()
    const location = useLocation()
    const { channel } = useParams()
    const params = useMemo(
        () => queryString.parse(location.search.slice(1, location.search.length)),
        [location.search]
    );

    // Tự động gọi grant khi show = true và có channel
    useEffect(() => {
        if (show && channel) {
            handleGrantAuthorization(channel, params);
        }
    }, [show, channel, handleGrantAuthorization, params]);

    // Xử lý kết quả grant
    useEffect(() => {
        if (!show) {
            processedSuccessRef.current = false;
            return;
        }
        if (!dataGrantAuthorization) return;

        const result = dataGrantAuthorization.scPartnerAuthorizationGrant;
        const successValue = result?.success;

        if (successValue == 1 || successValue === true || successValue === '1') {
            if (processedSuccessRef.current) return;
            processedSuccessRef.current = true;
            onHide();
            showAlert.success('Đã kết nối thành công');
            setError('');
            return;
        }

        if (successValue !== undefined && successValue !== null && successValue != 1) {
            setError(result?.message || 'Có lỗi xảy ra');
        }
    }, [dataGrantAuthorization, show, onHide]);

    const handleRetry = () => {
        setError('')
        if (!channel) return;
        // Khi lỗi: "KẾT NỐI LẠI" sẽ gọi scPartnerAuthorizationUrl và redirect sang authorization_url
        handleReconnectPartnerAccount(channel);
    }

    return (
        <Modal
            open={show}
            centered
            closable={false}
            footer={null}
            width={loadingGrantAuthorization && !error ? 200 : 400}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center', padding: '20px 0' }}>
                {loadingGrantAuthorization && !error && (
                    <>
                        <Text>Đang kết nối</Text>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    </>
                )}

                {!!error && (
                    <>
                        <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                        <Text style={{ wordBreak: 'break-word', display: 'block' }}>
                            {error}
                        </Text>
                        <Text style={{ display: 'block' }}>
                            Bạn vui lòng kết nối lại hoặc liên hệ với CSKH qua số hotline 0986096894 để được hỗ trợ.
                        </Text>
                        <Space>
                            <Button
                                type="default"
                                onClick={onHide}
                                style={{ width: 150 }}
                            >
                                <strong>ĐÓNG</strong>
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleRetry}
                                style={{ width: 150 }}
                            >
                                <strong>KẾT NỐI LẠI</strong>
                            </Button>
                        </Space>
                    </>
                )}
            </Space>
        </Modal>
    )
}

export default ModalAddAccountRedirect