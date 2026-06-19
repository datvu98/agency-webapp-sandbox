import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Table, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input, Form } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { UserSettingWrapper } from '../Setting.styles';
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import mutate_agencyChangePassword from "graphql/mutations/mutate_agencyChangePassword";
import { showAlert } from "utils/helper";
import MainInfo from "./components/MainInfo";
import SubUserRole from "./components/SubUserRole";
import mutate_agencyCreateSubUserV2 from "graphql/mutations/mutate_agencyCreateSubUserV2";
import query_agencyGetRoles from "graphql/queries/query_agencyGetRoles";

const { Text } = Typography;

interface Role {
    code: string;
    name: string;
}

interface PrefillData {
    smes: number[];
    stores: number[];
    chatStores: number[];
    warehouses: number[];
    roles: Role[];
}

type CurrentSelectType = {
    smes: number[];
    stores: number[];
    chat_stores: number[];
    warehouses: number[];
    roles: string[];
};

const SubUserCreate = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(selectGlobalSlice);
    const prefillData: PrefillData | null = location.state as PrefillData | null;

    console.log(prefillData)
    useEffect(() => {
        if (prefillData) {
            setCurrentSelect({
                smes: prefillData?.smes || [],
                stores: prefillData?.stores || [],
                chat_stores: prefillData?.chatStores || [],
                warehouses: prefillData?.warehouses || [],
                roles: prefillData?.roles?.map(item => item?.code) || []
            })
        }
    }, [prefillData])

    const [currentSelect, setCurrentSelect] = useState<CurrentSelectType>({
        smes: [],
        stores: [],
        chat_stores: [],
        warehouses: [],
        roles: []
    });

    const [form] = Form.useForm();

    const [mutate, { loading: loadingCreateSubUser }] = useMutation(mutate_agencyCreateSubUserV2);

    const { data: dataRoles, loading: loadingRoles } = useQuery(query_agencyGetRoles, {
        fetchPolicy: 'network-only'
    })
    const optionRoles = useMemo(() => {
        return dataRoles?.agencyGetRoles?.items?.map(item => {
            return {
                label: item?.name,
                value: `${item?.code}`
            }
        })
    }, [dataRoles])
    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Quản lý tài khoản " :"Cấu hình", pathname: "/settings" },
            {
                title: 'Tạo tài khoản phụ',
                pathname: '/settings/sub-user/create',
            },
        ]);
    }, []);

    const handleSubmit = async (values) => {
        if (!currentSelect?.chat_stores?.length && !currentSelect?.stores?.length) {
            showAlert.error('Vui lòng chọn ít nhất 1 gian hàng hoặc gian hàng chat')
            return
        }
        let { data } = await mutate({
            variables: {
                userCreateSubUserInput: {
                    name: values?.userName,
                    password: values?.newPassword,
                    roles: currentSelect?.roles?.length ? currentSelect?.roles : ['-1'],
                    stores: currentSelect?.stores?.length ? currentSelect?.stores : [],
                    warehouses: currentSelect?.warehouses?.length ? currentSelect?.warehouses : [],
                    chatStores: currentSelect?.chat_stores?.length ? currentSelect?.chat_stores : [],
                    username: values?.accountName,
                    smes: currentSelect?.smes?.length ? currentSelect?.smes : []
                }
            }
        })

        if (data?.agencyCreateSubUserV2?.success) {
            showAlert.success('Tạo tài khoản phụ thành công')
            navigate('/settings/sub-user')
        } else {
            showAlert.error('Tạo tài khoản phụ thất bại')
        }
    }

    return <UserSettingWrapper>
        <Helmet
            titleTemplate={user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"}
            defaultTitle={user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"}
        >
            <meta name="description" content={user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"} />
        </Helmet>
        <Spin spinning={false}>
            <Card title="Thông tin tài khoản phụ">
                <Form form={form} onFinish={handleSubmit}>
                    <MainInfo currentSelect={currentSelect} setCurrentSelect={setCurrentSelect} optionRoles={optionRoles} />
                    <SubUserRole currentSelect={currentSelect} setCurrentSelect={setCurrentSelect} />
                    <Flex style={{ marginTop: '20px' }} gap={12} justify="flex-end">
                        <Button
                            type="primary"
                            className="btn-base  btn-cancel"
                            onClick={() => { navigate('/settings/sub-user') }}
                        >
                            Hủy
                        </Button>
                        <Form.Item>
                            <Button
                                type="primary"
                                className="btn-base"
                                htmlType="submit"
                            >
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Flex>
                </Form>
            </Card>
        </Spin>
    </UserSettingWrapper >
};

export default SubUserCreate;