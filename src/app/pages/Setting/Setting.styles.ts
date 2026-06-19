import styled from "styled-components";

export default styled.div`
    .layout-sider {
        overflow: auto;
        min-height: calc(100vh - 64px);
        position: fixed;
        left: 0px;
        top: 64px;
        bottom: 0px;
        background: #fff;

        .ant-menu {
            margin-top: 4px;
        }

        .ant-menu-item {
            display: flex;
            align-items: center;
        }

        .base-antd-menu {
            min-width: 50vw;

            .ant-menu-title-content {
                padding-left: 4px !important;
            }
        }
    }

    .site-layout {
        min-height: calc(100vh - 55px);
        padding: 20px;

        .site-content {
            margin-top: 20px;
        }
    }
`;

export const UserSettingWrapper = styled.div`
    .card-switch {
        .ant-card-body {
            padding: 16px 24px;
        }
    }

    .card-message {
        margin-top: 20px;
    }

    .collapse-message {
        margin-top: 20px;
    }

    .icon-btn {
        font-size: 16px;
    }

    .list-message {
        background: #fff;
    }
    .ant-upload.ant-upload-select {
        overflow: hidden;
    }
    .input-item {
        text-align: left;
        margin: auto;
    }
    .search-field {
        margin-right: 40px;
        .search-label {
            display: block;
            min-width: 15%;
        }
    }

    .upbase-table {
        margin-top: 20px;
    }
    .bold {
        font-weight: bold;
    }
    .ant-checkbox-inner {
        border-color: #c8c8c8;
    }

    .custom-disabled-select.ant-select-disabled .ant-select-selector {
        background: rgba(0, 0, 0, 0.02) !important;
        color: rgba(0, 0, 0, 0.88) !important;
        opacity: 0.8;
    }
    .custom-disabled-input.ant-input-disabled {
        background: rgba(0, 0, 0, 0.02) !important;
        color: rgba(0, 0, 0, 0.88) !important;
        opacity: 0.8;
    }
    .custom-disabled-input .ant-input-number-input {
        height: 32px!important;
    }
`;

export const PartnerConnectWrapper = styled.div`
    .search-field {
        margin-right: 30%;
        .search-label {
            display: block;
            min-width: 15%;
        }
    }
   .upbase-table {
        margin-top: 20px;
    }
`;
