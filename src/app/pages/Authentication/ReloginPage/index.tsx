import { Button, Card, Flex, Result, Typography } from "antd";
import React, { Fragment } from "react";
import styled from "styled-components";
import Logo from 'assets/logo-dark.svg';
import { Helmet } from "react-helmet-async";

const ReloginWrapper = styled(Flex)`
    height: 100vh;
    background: #eff2f5;

    .card {        
        min-width: 600px;
        margin: auto;                    
        border-radius: 12px;
        // box-shadow: 0 8px 10px rgba(0,0,0,.08);

        .ant-card-body {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }
    }

    .img-relogin {
        margin-bottom: 30px;
        width: 150px;
    }

    .txt-title {        
        font-size: 28px;
        font-weight: bold;             
    }

    .btn-relogin {
        width: 100%;
        height: 50px;
    }
`;

const ReloginPage = () => {
    return (
        <Fragment>
            <Helmet
                titleTemplate="Đăng nhập lại - UpS"
                defaultTitle="Đăng nhập lại - UpS"
            >
                <meta name="description" content="Đăng nhập lại - UpS" />
            </Helmet>
            <ReloginWrapper justify="center" align="center">
                <Card className="card" bordered>
                    <img className="img-relogin" src={Logo} />
                    <Typography.Text className="txt-title">Xin vui lòng đăng nhập lại</Typography.Text>
                    <Result
                        status="404"
                    />
                    <Button
                        type="primary"
                        className="btn-relogin"
                        onClick={() => window.location.replace(`${process.env.REACT_APP_SME_ENDPOINT}/auth/login?source=chat`)}
                    >
                        Đăng nhập lại
                    </Button>
                </Card>
            </ReloginWrapper >
        </Fragment>
    )
};

export default ReloginPage;