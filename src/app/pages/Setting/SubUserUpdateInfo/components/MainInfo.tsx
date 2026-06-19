import { useMutation, useQuery } from "@apollo/client";
import { Select, Space, Col, Flex, Row, Typography, Input, Form } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import query_agencyGetRoles from "graphql/queries/query_agencyGetRoles";
import mutate_agencyCheckSubUserName from "graphql/mutations/mutate_agencyCheckSubUserName";

const { Text } = Typography;

const MainInfo = ({ dataSubUser, currentSelect, setCurrentSelect, optionRoles }) => {

    const [mutateCheckNameExist, { loading: loadingCheckNameExist }] = useMutation(mutate_agencyCheckSubUserName);

    const validateUniqueAccount = async (_, value) => {
        let { data: dataCheckNameExisted } = await mutateCheckNameExist({
            variables: {
                name: value
            }
        })
        if (!!dataCheckNameExisted?.agencyCheckSubUserName?.isExists) {
            return Promise.reject(new Error('Tài khoản đã tồn tại'));
        }
        return Promise.resolve();

    };
    const handleChange = (value: string[]) => {
        console.log(`selected ${value}`);
        setCurrentSelect(pre => {
            return {
                ...pre,
                roles: value
            }
        })
    };
    return <>
        <Row style={{ marginTop: '20px', marginRight: '30%' }}>
            <Flex vertical gap={12} style={{ width: '100%' }}>
                <Flex style={{ textAlign: 'right', width: '100%' }} align="center" justify="center">
                    <Col span={11}>
                        <Text strong>Tài khoản đăng nhập</Text>
                    </Col> <Col span={1}></Col>
                    <Col span={12}>
                        <Input disabled value={dataSubUser?.username}></Input>
                    </Col>
                </Flex>
                <Flex style={{ textAlign: 'right', width: '100%' }} align="center" justify="center">
                    <Col span={11}>
                        <Text strong>Tên người dùng</Text>
                    </Col> <Col span={1}></Col>
                    <Col span={12}>
                        <Form.Item
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value && (/^\s|\s$/.test(value))) {
                                            return Promise.reject(new Error('Tên tài khoản không được chứa khoảng trắng đầu và cuối'));
                                        }
                                        return Promise.resolve()
                                    }
                                }
                            ]}
                            name='userName'
                            className="input-item"
                        >
                            <Input maxLength={100}></Input>
                        </Form.Item>
                    </Col>
                </Flex>
                <Flex style={{ textAlign: 'right', width: '100%' }} align="center" justify="center">
                    <Col span={11}>
                        <Text strong>Nhóm quyền</Text>
                    </Col> <Col span={1}></Col>
                    <Col span={12}>
                        <Select
                            mode="multiple"
                            style={{ width: '100%', textAlign: 'left' }}
                            placeholder="Tất cả"
                            value={currentSelect?.roles}
                            onChange={handleChange}
                            options={optionRoles}
                            optionRender={(option) => (
                                <Space>
                                    <span role="img" aria-label={option.data.label}>
                                        {option.data.label}
                                    </span>
                                </Space>
                            )}
                        />
                    </Col>
                </Flex>
            </Flex>

        </Row>
    </>
};

export default MainInfo;