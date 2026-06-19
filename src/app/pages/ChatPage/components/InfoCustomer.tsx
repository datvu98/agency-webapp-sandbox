import { useMutation, useQuery } from "@apollo/client";
import { Card, Col, Empty, Flex, Row, Skeleton, Spin, Tag, Tooltip, Typography } from "antd";
import { SocketContext } from "app/contexts/SocketContext";
import mutate_crmUpdateCustomer from "graphql/mutations/mutate_crmUpdateCustomer";
import query_crmFindCustomer from "graphql/queries/query_crmFindCustomer";
import query_scGetOrders from "graphql/queries/query_scGetOrders";
import React, { Fragment, memo, useCallback, useContext } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { showAlert } from "utils/helper";
import { selectCurrentConverstation } from "../slice/selectors";
import AuthorizationWrapper from "app/components/AuthorizationWrapper";

const InfoCustomerWrapper = styled.div`
    margin: 20px;

    .tag-wrapper {
        margin-top: 20px;
    }    

    .ant-card-body {
        padding: 12px 24px;
    }
`;

const { Text } = Typography;

const InfoCustomer = () => {
    const currentConversation = useSelector(selectCurrentConverstation);
    const { loading: loadingCustomer, data: dataCustomer } = useQuery(query_crmFindCustomer, {
        variables: {
            ref_customer_id: currentConversation?.customer?.ref_id
        },
        skip: !currentConversation?.customer?.ref_id,
        fetchPolicy: 'cache-and-network'
    });

    const [crmUpdateCustomer, { loading: loadingCrmUpdateCustomer }] = useMutation(mutate_crmUpdateCustomer, {
        awaitRefetchQueries: true,
        refetchQueries: ['crmFindCustomer']
    });

    const onUpdateCustomer = useCallback(async (body, type) => {
        try {
            const mss = {
                ['address']: 'địa chỉ',
                ['email']: 'email',
                ['phone']: 'số điện thoại',
            };

            const { data } = await crmUpdateCustomer({
                variables: {
                    id: dataCustomer?.crmFindCustomer?.id,
                    ...body
                }
            });

            if (!!data?.crmUpdateCustomer?.success) {
                showAlert.success(`Cập nhật ${mss[type]} thành công`);
            } else {
                showAlert.error(data?.crmUpdateCustomer?.message || `Cập nhật ${mss[type]} thất bại`)
            }
        } catch {
            showAlert.error('Đã có lỗi xảy ra, xin vui lòng thử lại');
        }
    }, [dataCustomer?.crmFindCustomer]);

    if (!dataCustomer?.crmFindCustomer) {
        return <Flex justify="center" align="center" style={{ marginTop: '30%' }} id="#modal-container">
            <Empty description="Chưa có thông tin khách hàng" />
        </Flex>
    }

    return (
        <InfoCustomerWrapper>
            <Spin spinning={loadingCrmUpdateCustomer}>
                <Card style={{ background: '#fff6f0', border: '1px solid #fff6f0' }} title="Thông tin cơ bản">
                    {loadingCustomer && <Skeleton title={false} active paragraph={{ rows: 3 }} />}
                    {!loadingCustomer && <Flex vertical gap={10}>
                        <Row>
                            <Col span={6}>
                                <Text>Email:</Text>
                            </Col>
                            <AuthorizationWrapper keys={['customer_service_chat_action']}>
                                <Col span={18}>
                                    <Text
                                        editable={{
                                            onChange: value => onUpdateCustomer({
                                                email: value
                                            }, 'email')
                                        }}
                                    >
                                        {dataCustomer?.crmFindCustomer?.email}
                                    </Text>
                                </Col>
                            </AuthorizationWrapper>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <Text>SĐT:</Text>
                            </Col>
                            <AuthorizationWrapper keys={['customer_service_chat_action']}>
                                <Col span={18}>
                                    <Text
                                        editable={{
                                            onChange: value => onUpdateCustomer({
                                                phone: value
                                            }, 'phone')
                                        }}
                                    >{dataCustomer?.crmFindCustomer?.phone}</Text>
                                </Col>
                            </AuthorizationWrapper>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <Text>Địa chỉ:</Text>
                            </Col>
                            <AuthorizationWrapper keys={['customer_service_chat_action']}>
                                <Col span={18}>
                                    <Text
                                        editable={{
                                            onChange: value => onUpdateCustomer({
                                                address: value
                                            }, 'address')
                                        }}
                                    >
                                        {dataCustomer?.crmFindCustomer?.address}
                                    </Text>
                                </Col>
                            </AuthorizationWrapper>
                        </Row>
                    </Flex>}
                </Card>
            </Spin>
            <Flex className="tag-wrapper" vertical gap={6}>
                <Typography.Text strong>Tag khách hàng</Typography.Text>
                <Spin spinning={loadingCustomer}>
                    {dataCustomer?.crmFindCustomer?.crmTag?.length == 0 && <Empty imageStyle={{ width: 100, margin: 'auto' }} description="Chưa có tag khách hàng" />}
                    {dataCustomer?.crmFindCustomer?.crmTag?.length > 0 && <Flex align="center" wrap="wrap" gap={10}>
                        {dataCustomer?.crmFindCustomer?.crmTag?.map(tag => {
                            if (tag?.title?.length > 12) {
                                return <Tag>
                                    <Tooltip placement="bottom" title={tag?.title}>
                                        {tag?.title?.slice(0, 12)}...
                                    </Tooltip>
                                </Tag>
                            }

                            return <Tag>{tag?.title}</Tag>
                        })}
                    </Flex>}
                </Spin>
            </Flex>
        </InfoCustomerWrapper>
    )
};

export default memo(InfoCustomer);