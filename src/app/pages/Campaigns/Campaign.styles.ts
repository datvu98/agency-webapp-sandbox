import { Flex } from "antd";
import styled, { css, keyframes } from "styled-components";


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

export const CampaignWrapper = styled.div`
    .site-layout {
        min-height: calc(100vh - 55px);
    }
    
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
        margin-right: 30%;
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

    .list-campaign-table {
        .campaign-parent-row > td {
            background: rgb(245, 245, 245) !important;
        }
        .campaign-parent-row:hover > td {
            background: rgb(244, 244, 244) !important;
        }
        .campaign-store-row > td {
            background: #fff !important;
        }

        /* Ẩn cột indent expand mặc định của Ant Design */
        .ant-table-row-expand-icon-cell {
            display: none !important;
            padding: 0 !important;
            width: 0px !important;
        }

        .campaign-store-row-error > td {
            padding: 0 !important;
        }

        /* Ẩn indent thụt đầu dòng ở store row */
        .campaign-store-row .ant-table-row-indent {
            display: none !important;
        }

        /* Ẩn expand icon built-in (dùng custom trong cell) */
        .ant-table-row-expand-icon {
            display: none !important;
        }

        /* Đảm bảo flex container không wrap */
        .campaign-parent-row td:first-child {
            .ant-flex {
                flex-wrap: nowrap !important;
            }
        }

        /* Style cho custom expand icon */
        .custom-expand-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            margin-right: 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            flex-shrink: 0;
            color: #a6a6a6;
        }

        .custom-expand-icon:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
    }

    .custom-input-number input {
        height: 32px !important;
        line-height: 32px !important;
    }

    .text-count {
        color: #ff5629;
    }

    .campaign-register-header {
        margin-bottom: 20px;
    }

    .campaign-register-table {
        /* Row nằm giữa nhóm KOC (không phải đầu, không phải cuối): ẩn border-bottom */
        tr.register-inner-row > td {
            border-bottom: none !important;
        }

        /* Style checkbox trong bảng */
        .ant-checkbox-inner {
            border-radius: 4px;
            border-color: #d9d9d9;
        }

        /* Khi checkbox bị disabled (ví dụ status khác pending) */
        .ant-checkbox-wrapper-disabled {
            cursor: not-allowed;
            opacity: 0.55;
        }

        .ant-checkbox-wrapper-disabled .ant-checkbox-inner {
            background-color:rgb(209, 209, 209);
            border-color:rgb(209, 209, 209);
        }

        /* Khi checked */
        .ant-checkbox-checked .ant-checkbox-inner {
            border-color: #ff5629;
            background-color: #ff5629;
        }
    }

    .ant-input-affix-wrapper.ant-input-outlined {
        height: 32px;
    }

    .ant-table-row-selected > td {
        background-color: #ffffff !important;
    }
    
    .ant-table-row-selected:hover > td {
        background-color: #ffffff !important;
    }

    .toc-col {
      transition: all 0.3s ease;
    }

    .main-col {
      transition: all 0.3s ease;
    }

    /* ===== SECTION ANIMATION ===== */
    .section-content {
      overflow: hidden;
      transition: all 0.35s ease;
    }
    
    .section-content.expanded {
      max-height: 4000px; /* đủ lớn */
      opacity: 1;
    }
    
    .section-content.collapsed {
      max-height: 0;
      opacity: 0;
    }
    
    /* optional cho mượt hơn */
    .ant-form-item-required::before {
        display: none !important;
    }

    .form-item-required {
        color: #ff4d4f !important;
    }

    .avatar-letter {
        background-color: #1677ff;
        color: #fff;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;


export const popupScrollbarCss = css`
  scrollbar-width: thin;
  scrollbar-color: rgba(22, 22, 22, 0.24) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(22, 22, 22, 0.18);
    border-radius: 999px;
    border: 1px solid transparent;
    background-clip: content-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(22, 22, 22, 0.28);
    border: 1px solid transparent;
    background-clip: content-box;
  }
`

export const slideInFromRight = keyframes`
  from { transform: translateX(60px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`

export const slideInFromLeft = keyframes`
  from { transform: translateX(-60px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
`

export const PopupScrollArea = styled(Flex)`
  ${popupScrollbarCss}
`

export const ReviewAirSlideWrapper = styled.div<{ direction: 'left' | 'right' | null; animKey: number }>`
  display: flex;
  gap: 16px;
  flex-wrap: nowrap;
  animation: ${({ direction }) =>
    direction === 'right' ? slideInFromRight :
      direction === 'left' ? slideInFromLeft :
        'none'} 0.3s ease;
`

export const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;

  @media (max-width: 1200px) { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 900px)  { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: repeat(2, 1fr); }
`

export const VideoGridCell = styled.div`
  width: 100%;
  aspect-ratio: 56 / 100;
  overflow: hidden;
  border-radius: 6px;
  background: #000;
`

export const KocVideoScrollArea = styled.div`
  overflow-y: auto;
  max-height: calc(80vh - 80px);
  ${popupScrollbarCss}
`