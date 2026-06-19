import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import NProgress from 'nprogress';
import { ChannelAddRedirectWrapper } from '../Setting.style';
import { Button, Flex, Modal, Spin, Typography } from "antd";
import { CloseCircleOutlined, WarningFilled } from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import queryString from 'querystring';
import { useLazyQuery, useMutation } from "@apollo/client";
import mutate_scConversationAuthorizationGrant from "graphql/mutations/mutate_scConversationAuthorizationGrant";
import { showAlert } from "utils/helper";
import query_scConversationAuthorizationUrl from "graphql/queries/query_scConversationAuthorizationUrl";

const ChannelsAddRedirectModal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { channel } = useParams();
    const params = queryString.parse(location.search.slice(1, location.search.length));

    const [errors, setErrors] = useState<string>('');
    const [authorize, { data: dataAuthozie, loading: loadingAuthorize }] = useLazyQuery(query_scConversationAuthorizationUrl);

    const [grantAuthorization, { loading: loadingGrant, data, error: errorGrant }] = useMutation(mutate_scConversationAuthorizationGrant, {
        awaitRefetchQueries: true,
        refetchQueries: ['sc_conversation_stores']
    });

    useMemo(async () => {
        NProgress.start();

        console.log({
            variables: {
                connector_channel_code: channel,
                params: Object.keys(params).map(key => ({ key, value: params[key] }))
            }
        })
        const { data } = await grantAuthorization({
            variables: {
                connector_channel_code: channel,
                params: Object.keys(params).map(key => ({ key, value: params[key] }))
            }
        }) as any;
        NProgress.done();

        if (data?.scConversationAuthorizationGrant?.success == 1) {
            navigate('/setting/channels');
            showAlert.success('Đã kết nối thành công');
        } else {
            setErrors(data?.scConversationAuthorizationGrant?.message || 'Bạn vui lòng kết nối lại hoặc liên hệ với CSKH qua số hotline 0944427799 để được hỗ trợ.');
        }

    }, []);

    const onAddChannel = useCallback(async () => {
        try {
            authorize({
                variables: {
                    connector_channel_code: channel
                }
            }).then(({ data }) => {
                if (data?.scConversationAuthorizationUrl?.authorization_url) {
                    window.location.replace(data?.scConversationAuthorizationUrl?.authorization_url);
                } else {
                    showAlert.error('Có lỗi xảy ra, xin vui lòng thử lại');
                }
            });
        } catch (error) {
            showAlert.error('Có lỗi xảy ra, xin vui lòng thử lại');
        }
    }, [channel]);


    return (
        <ChannelAddRedirectWrapper>
            {/* <Spin spinning={loadingGrant} fullscreen size="large" /> */}
            <Modal
                title=""
                open={!!errors}
                closable={false}
                width={600}
                style={{ textAlign: 'center', top: '30%' }}
                footer={[
                    <Flex className="w-100" align="center" gap={20} justify="center">
                        <Button
                            type="primary"
                            className="btn-base btn-cancel"
                            onClick={() => navigate('/setting/channels')}
                            disabled={loadingAuthorize}
                        >
                            Đóng
                        </Button>
                        <Button
                            type="primary"
                            className="btn-base"
                            loading={loadingAuthorize}
                            onClick={onAddChannel}
                        >
                            Kết nối lại
                        </Button>
                    </Flex>
                ]}
            >
                <Spin spinning={loadingAuthorize}>
                    <Flex vertical align="center" justify="center" style={{ marginBottom: 20 }} gap={15}>
                        <CloseCircleOutlined style={{ color: "red", fontSize: 40 }} />
                        <Typography.Text>{errors}</Typography.Text>
                    </Flex>
                </Spin>
            </Modal>
        </ChannelAddRedirectWrapper>
    )
};

export default memo(ChannelsAddRedirectModal);