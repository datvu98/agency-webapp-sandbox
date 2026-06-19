import { Button, Flex, Result } from "antd";
import React, { Fragment, memo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from 'react-router-dom';

const AuthorizationPage = () => {
    const navigate = useNavigate();

    return (
        <Fragment>
            <Helmet
                titleTemplate="403 Page Not Authorization - UpS"
                defaultTitle="403 Page Not Authorization - UpS"
            >
                <meta name="description" content="403 Page Not Authorization - UpS" />
            </Helmet>
            <Flex justify="center" align="center" style={{ height: 'calc(100vh - 64px)' }}>
                <Result
                    status="403"
                    title="403"
                    subTitle="Xin lỗi. Bạn không có quyền truy cập trang này"
                />
            </Flex>
        </Fragment>
    )
};

export default memo(AuthorizationPage);