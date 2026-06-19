import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`

@font-face {
  font-family: 'Roboto';
}

  html,
  body {
    height: 100%;
    width: 100%;
  }
  
  * {
    font-family: 'Roboto', sans-serif !important;
  }

  body {
    font-family: 'Roboto', sans-serif !important;
  }

  #root {
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: 'Roboto', sans-serif !important;
    line-height: 1.5em;
  }

  input, select {
    font-family: inherit;
    font-size: inherit;
  }

  .color-danger {
    color: #f5222d;
  }

  .color-success {
    color: #52c41a;
  }

  .input-base {
    height: 35px;
  }

  .select-base {
    height: 35px;
  }

  .text-paragraph {
    margin-bottom: 0px !important;
  }

  .text-small {
    font-size: 12px;
  }

  .anticon {
    vertical-align: 0px !important;
  }

  #nprogress .bar {
    background: #ff5629 !important;
  }

  #nprogress .peg {
    box-shadow: 0 0 10px #ff5629, 0 0 5px #ff5629 !important;
  }

  #nprogress .spinner-icon {
    border-top-color: #ff5629 !important;
    border-left-color: #ff5629 !important;
  }

  .w-100 {
    width: 100% !important;
  }

  .empty-table {
    margin: 10px 0px 20px;
  }

  .filter-report-fixed-top {
    position: fixed;
    top: 64px;
    right: 0px;
    z-index: 9;
    left: 240px;
    margin: 0px !important;
    background-color: #fff;
    padding: 10px;
    box-shadow: 0px 10px 10px -3px rgb(0 0 0 / 10%);
    transition: all 0.3s ease;
    border-radius: 4px;
  }

  .filter-report-fixed-top.collapse {
    left: 64px;
  }

  .setting-table.ant-upbase .ant-table-header{
    position: sticky;
    top: 54px !important;
    right: 0px;
    z-index: 9;
    left: 240px;
    margin: 0px !important;
    background-color: #fff;
    transition: all 0.3s ease;
  }

  .text-fit {
    min-width: fit-content;
  }

  .text-white {
    color: #fff;
  }

  .text-paragraph {
    margin: 0px;
  }

  .icon-empty-table {
    width: 100px;
  }
  
  .ant-breadcrumb li:last-child {
    .ant-breadcrumb-link {
      color: #000000 !important;
    }
  }

  .editorClassName {
    border: 1px solid #f1f1f1;
    height: 400px;
    border-radius: 2px;
    padding: 12px;

    .public-DraftStyleDefault-ul {
      margin: 0 !important;
    }

    .public-DraftStyleDefault-block {
      margin: 0 !important;
    }

    .public-DraftStyleDefault-ol {
      margin: 0 !important;
    }
  }

  .ant-image-mask-info .anticon {
    position: relative;
    top: -3px;    
  }

  .icon-base {
    position: relative;
    top: 2px;
  }

  .hidden-table-column {
    display: none;
  }

  .text-right {
    text-align: right;
  }

  .ant-input-number-input-wrap input {
    height: 38px;
  }

  .upbase-table-column-shopee {
    background-color: rgba(255, 85, 41, 0.05) !important;
  }

  .upbase-table-column-lazada {
    background-color: rgba(9, 98, 243, 0.05) !important;
  }

  .btn-base {
    min-width: 100px;
    height: 35px;
  }

  .color-base {
    color: #ff5629 !important;
    border-color: #ff5629 
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .chat-citem.active {
    background: #fff6f0 !important;
  }

  .cursor-not-allowed {
    cursor: not-allowed;
  }

  .btn-cancel {
    border: 1px solid #C4C4C4 !important;
    background: #C4C4C4 !important;
  }
  
  .btn-cancel:hover {
    background-color: #C4C4C4;
  }

  .input-item .ant-select-selector {
    width: 100%;
    border-radius: 4px;
    height: 40px;        
  }
  
  .base-tab .ant-tabs-tab {
    padding: 12px !important;
  }

  .base-antd-menu {
    min-width: 50vw;
  }

  .base-antd-menu .ant-menu-title-content {
    padding: 12px !important;
  }

  .ant-upbase th.ant-table-cell {
    // background-color: rgba(255, 86, 41, .1) !important;
    padding: 12px 16px !important;
  }

  .ant-menu-inline-collapsed-tooltip { 
    display: none !important; 
  }

  .ant-checkbox .ant-checkbox-inner {
    border-color: #ff5629;
  }

  .icon-sku {
    font-size: 12px;
  }

  .space-base {
    width: 100%;
  }

  .ant-pagination-options {
    display: none !important;
  }

  .ant-pagination-item-link .anticon {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .wpnp-notification {
    padding: 15px !important;
    max-height: unset !important;
  }

  .wonderpush-notification-preview {
    min-height: unset !important;
  }

  .wonderpush-notification-preview {
    align-items: start !important;
  }

  .wonderpush-notification-preview .wpnp-ios {
    border-color: #000 !important;
  }

  .wonderpush-notification-preview .wpnp-android {
    border-color: #000 !important;
  }

  .wonderpush-notification-preview .wpnp-android .wpnp-volume {
    background-color: #000 !important;
  }

  .wonderpush-notification-preview .wpnp-android .wpnp-lock {
    background-color: #000 !important;
  }
  
  .wonderpush-notification-preview .wpnp-android .wpnp-screen .wpnp-current-date {
    color: gray !important;
  }
  .wonderpush-notification-preview .wpnp-android .wpnp-screen .wpnp-current-time {
    color: gray !important;
  }
  .wonderpush-notification-preview .wpnp-ios .wpnp-screen .wpnp-close-notification .wpnp-current-time {
    color: gray !important;
  }
  .wonderpush-notification-preview .wpnp-ios .wpnp-screen .wpnp-close-notification .wpnp-current-date {
    color: gray !important;
  }

  .wonderpush-notification-preview .wpnp-ios .wpnp-button {
    background-color: #000 !important;
  }

  .wonderpush-notification-preview .wpnp-android .wpnp-button {
    background-color: #000 !important;
  }

  .wonderpush-notification-preview .wpnp-android .wpnp-screen .wpnp-current-time {
    margin-top: 30px !important;
    font-size: 50px !important;
  }

  .wonderpush-notification-preview .wpnp-ios .wpnp-screen .wpnp-close-notification .wpnp-current-time {
    margin-top: 30px !important;
    font-size: 50px !important;
  }


  .editor-wrapper {
    border: 1px solid #f1f1f1;
    min-height: 200px;
    max-height: 400px;
    border-radius: 2px;
    padding: 12px;
  }

  .toolbar-wrapper {
    display: none !important;
  }

  .rdw-mention-link {
    color: '#f77f00' !important;
  }

  .ant-modal-content {
    border-radius: 8px !important;
  }

  .ant-modal-content {
    border-radius: 8px !important;
  }

  .ant-modal-header {
    border-top-left-radius: 8px !important;
    border-top-right-radius: 8px !important;
  }
`;
