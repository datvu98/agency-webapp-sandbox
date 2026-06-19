import { Button, Flex, Result } from "antd";
import React, { Fragment, memo } from "react";
import { Helmet } from "react-helmet-async";

const ErrorPage = () => {
    return (
        <Fragment>
            <Helmet
                titleTemplate="500 Page Something Went Wrong - UpS"
                defaultTitle="500 Page Something Went Wrong - UpS"
            >
                <meta name="description" content="500 Page Something Went Wrong - UpS" />
            </Helmet>
            <Flex justify="center" align="center" style={{ height: 'calc(100vh - 64px)' }}>
                <Result
                    status="500"
                    title="500"
                    subTitle="Xin lỗi. Đã có lỗi xảy ra"
                />
            </Flex>
        </Fragment>
    )
};

export default memo(ErrorPage);