import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, Checkbox, Flex, Modal, Radio, Spin, Typography } from "antd";
import query_scConversationAuthorizationUrl from "graphql/queries/query_scConversationAuthorizationUrl";
import React, { memo, useCallback, useMemo, useState } from "react";
import { showAlert } from "utils/helper";

interface ModalAddChannelProps {
    show: boolean,
    dataStores: any,
    onHide: () => void
}

const ModalAddChannel = ({
    show,
    dataStores,
    onHide
}: ModalAddChannelProps) => {
    const [value, setValue] = useState<String>("shopee");
    const [authorize, { loading: loadingAuthorize }] = useLazyQuery(query_scConversationAuthorizationUrl);

    const onAddChannel = useCallback(async () => {
        try {
            authorize({
                variables: {
                    connector_channel_code: value
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
    }, [value]);

    const onResetModal = useCallback(() => {
        setValue("shopee");
        onHide();
    }, []);

    return (
        <Modal
            title="Vui lòng chọn gian hàng muốn kết nối"
            open={show}
            closable={false}
            style={{ textAlign: 'center', top: '30%' }}
            footer={[
                <Flex align="center" gap={20} justify="center">
                    <Button
                        type="primary"
                        className="btn-base btn-cancel"
                        disabled={loadingAuthorize}
                        onClick={onResetModal}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        className="btn-base"
                        loading={loadingAuthorize}
                        onClick={onAddChannel}
                    >
                        Thêm
                    </Button>
                </Flex>
            ]}
        >
            <Spin spinning={loadingAuthorize}>
                <Flex align="center" justify="center" style={{ margin: '30px 0px 40px' }}>
                    <Radio.Group onChange={e => setValue(e.target.value)} value={value}>
                        {dataStores?.op_connector_channels
                            ?.filter(channel => channel?.code != 'other' && channel?.code != 'tiktok')
                            ?.map(channel => <Radio
                                style={{ marginLeft: 20 }}
                                onChange={e => setValue(e?.target?.value)}
                                value={channel?.code}
                            >
                                <Flex justify="center" align="center" gap={4}>
                                    <img src={channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
                                    <Typography.Text>{channel?.name}</Typography.Text>
                                </Flex>
                            </Radio>)}
                    </Radio.Group>
                </Flex>
            </Spin>
        </Modal>
    )
};

export default memo(ModalAddChannel);