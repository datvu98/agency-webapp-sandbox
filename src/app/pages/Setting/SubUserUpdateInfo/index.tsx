import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Table, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input, Form } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { UserSettingWrapper } from '../Setting.styles';
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { showAlert } from "utils/helper";
import MainInfo from "./components/MainInfo";
import SubUserRole from "./components/SubUserRole";
import query_agencyGetRoles from "graphql/queries/query_agencyGetRoles";
import query_agencyGetSubUserById from "graphql/queries/query_agencyGetSubUserById";
import mutate_agencyUpdateSubUserV2 from "graphql/mutations/mutate_agencyUpdateSubUserV2";


const { Text } = Typography;

type CurrentSelectType = {
    smes: number[];
    stores: number[];
    chat_stores: number[];
    warehouses: number[];
    roles: string[];
};

const SubUserUpdateInfo = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const { user } = useSelector(selectGlobalSlice);
    const [currentSelect, setCurrentSelect] = useState<CurrentSelectType>({
        smes: [],
        stores: [],
        chat_stores: [],
        warehouses: [],
        roles: []
    });

    const { id } = useParams()
    console.log(id)

    const [form] = Form.useForm();

    const [mutate, { loading: loadingUpdateSubUSer }] = useMutation(mutate_agencyUpdateSubUserV2);

    const { data: dataSubUser, loading: loadingDataSubUser } = useQuery(query_agencyGetSubUserById, {
        variables: {
            id: Number(id)
        },
        fetchPolicy: 'network-only'
    })
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
                title: 'Cập nhật thông tin tài khoản phụ',
                pathname: '/settings/sub-user/change-info',
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
                userUpdateSubUserInput: {
                    id: Number(id),
                    name: values?.userName,
                    roles: currentSelect?.roles?.length ? currentSelect?.roles : ['-1'],
                    stores: currentSelect?.stores?.length ? currentSelect?.stores : [],
                    warehouses: currentSelect?.warehouses?.length ? currentSelect?.warehouses : [],
                    chatStores: currentSelect?.chat_stores?.length ? currentSelect?.chat_stores : [],
                    smes: currentSelect?.smes?.length ? currentSelect?.smes : []
                }
            }
        })

        if (data?.agencyUpdateSubUserV2?.success) {
            showAlert.success('Cập nhật tài khoản phụ thành công')
            navigate('/settings/sub-user')
        } else {
            showAlert.error(data?.agencyUpdateSubUserV2?.message || 'Cập nhật tài khoản phụ thất bại')
            navigate('/settings/sub-user')
        }
    }

    useEffect(() => {
        if (dataSubUser) {
            setCurrentSelect({
                smes: dataSubUser?.agencyGetSubUserById?.data?.smes || [],
                stores: dataSubUser?.agencyGetSubUserById?.data?.stores || [],
                chat_stores: dataSubUser?.agencyGetSubUserById?.data?.chatStores || [],
                warehouses: dataSubUser?.agencyGetSubUserById?.data?.warehouses || [],
                roles: dataSubUser?.agencyGetSubUserById?.data?.roles != '-1' ? dataSubUser?.agencyGetSubUserById?.data?.roleItems?.map(item => item?.code) : []
            })
            form.setFieldsValue({
                userName: dataSubUser?.agencyGetSubUserById?.data?.name,
            });
        }
    }, [dataSubUser]);

    return <UserSettingWrapper>
        <Helmet
            titleTemplate={user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"}
            defaultTitle={user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"}
        >
            <meta name="description" content={user?.category_code == 'fulfillment' ? "Quản lý tài khoản phụ" : "Phân quyền tài khoản phụ"} />
        </Helmet>
        <Spin spinning={false}>
            <Card title="Thông tin tài khoản phụ">
                <Form form={form} onFinish={handleSubmit}
                >
                    <MainInfo dataSubUser={dataSubUser?.agencyGetSubUserById?.data} currentSelect={currentSelect} setCurrentSelect={setCurrentSelect} optionRoles={optionRoles} />
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
                                disabled={loadingUpdateSubUSer || loadingDataSubUser}
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

export default SubUserUpdateInfo;