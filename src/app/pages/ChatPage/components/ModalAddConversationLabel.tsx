import { WarningFilled } from "@ant-design/icons";
import { Button, Checkbox, Empty, Flex, Modal, Radio, Spin, Typography } from "antd";
import React, { Fragment, memo, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import ModalActionLabel from "./ModalActionLabel";
import { useQuery } from "@apollo/client";
import query_conversationLabelList from "graphql/queries/query_conversationLabelList";
import classNames from "classnames";
import { useLayoutContext } from "app/contexts/LayoutContext";
import { hasPermissionAction } from "utils/helper";
import AuthorizationWrapper from "app/components/AuthorizationWrapper";

interface ModalAddConversationLabelProps {
    show: boolean,
    loading: boolean,
    onAdd: (ids: number[]) => void,
    onHide: () => void,
    sme?: number
}

const { Text } = Typography;
const MAX_LABEL_ADD_CONVERSATION = 20;

const TagConversationWrapper = styled(Flex).attrs((props: { bgColor: string }) => props)`
    background-color: ${(props) => props.bgColor || ''};
    padding: 4px 12px;
    border-radius: 10px;
`;

const ModalAddConversationLabel = ({
    show,
    onAdd,
    loading,
    onHide,
    sme
}: ModalAddConversationLabelProps) => {
    const [ids, setIds] = useState<number[]>([]);
    const [openAddLabel, setOpenLabel] = useState<boolean>(false);
    const [currentLabel, setCurrentLabel] = useState<any>(null);

    const { loading: loadingConversationLabel, data: dataConversationLabel } = useQuery(query_conversationLabelList, {
        fetchPolicy: 'cache-and-network',
        variables: { page: 1, pageSize: 20, smeId: sme }
    });

    const dataLabel = useMemo(() => {
        return dataConversationLabel?.conversationLabelList?.items?.filter(item => item?.smeId == sme)
    }, [dataConversationLabel?.conversationLabelList?.items])
    return (
        <Fragment>
            <ModalActionLabel
                sme={sme}
                show={openAddLabel}
                currentLabel={currentLabel}
                type={currentLabel ? "update" : "create"}
                onHide={() => {
                    setOpenLabel(false)
                    setCurrentLabel(null);
                }}
            />
            <Modal
                title="Thêm nhãn hội thoại"
                open={show}
                closable={true}
                maskClosable={false}
                onCancel={onHide}
                width={650}
                centered
                footer={[
                    <Button
                        type="primary"
                        className="btn-base"
                        disabled={loadingConversationLabel || dataLabel == 0 || ids?.length == 0 || !hasPermissionAction(['customer_service_chat_action'])}
                        loading={loading}
                        onClick={() => onAdd(ids)}
                    >
                        Thêm
                    </Button>
                ]}
            >
                <Spin spinning={loadingConversationLabel || loading}>
                    <Flex style={{ margin: '30px 0px 40px' }} vertical gap={8}>
                        <Flex justify="space-between" align="center">
                            <Text>{`Danh sách nhãn (${dataLabel?.length || 0}/${MAX_LABEL_ADD_CONVERSATION})`}</Text>
                            <AuthorizationWrapper keys={['customer_service_chat_label_create']}>
                                <Text
                                    className={classNames("color-base cursor-pointer", { "cursor-not-allowed": dataLabel?.length == MAX_LABEL_ADD_CONVERSATION })}
                                    onClick={() => {
                                        if (dataLabel?.length == MAX_LABEL_ADD_CONVERSATION) return;
                                        setOpenLabel(true)
                                    }}
                                >
                                    + Thêm mới nhãn
                                </Text>
                            </AuthorizationWrapper>
                        </Flex>
                        {(!dataConversationLabel?.conversationLabelList || dataLabel?.length == 0) && (
                            <Empty description="Chưa có danh sách nhãn" />
                        )}
                        {dataLabel?.length > 0 && (
                            <Flex className="mt-4" align="center" wrap="wrap" gap={12}>
                                {dataLabel?.map(item => (
                                    <TagConversationWrapper bgColor={item?.color} align="center" gap={8}>
                                        <Checkbox
                                            checked={ids?.some(id => id == item?.id)}
                                            onChange={() => setIds(prev => {
                                                if (ids?.some(id => id == item?.id)) {
                                                    return prev.filter(id => id != item?.id)
                                                } else {
                                                    return prev.concat(item?.id)
                                                }
                                            })}
                                        />
                                        <Text
                                            className="cursor-pointer"
                                            style={{ color: '#fff' }}
                                            onClick={() => {
                                                setOpenLabel(true);
                                                setCurrentLabel(item);
                                            }}
                                        >
                                            {item?.title}
                                        </Text>
                                    </TagConversationWrapper>
                                ))}
                            </Flex>
                        )}
                    </Flex>
                </Spin>
            </Modal>
        </Fragment>
    )
};

export default memo(ModalAddConversationLabel);