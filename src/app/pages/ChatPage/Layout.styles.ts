import styled from 'styled-components';

export default styled.div`
  .chat-filter-container {
    background-color: #fff;
    height: 100%;
    display: flex;

    & > .ant-menu {
      border-inline-end: none !important;
    }

    .chat-filter-item {
      inset-inline-start: 0;
      padding-inline: calc(50% - 14px);
      text-overflow: clip;
      margin-inline: 4px;
      margin-block: 4px;
      width: calc(100% - 10px);
      height: 40px;
      line-height: 40px;
      border-radius: 8px;
      font-size: 16px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.06);
        color: rgba(0, 0, 0, 0.88);
      }

      &.active {
        background-color: #fff6f0;
        color: #ff5629;
      }
    }
  }

  .chat-filter-icon {
      border-radius: 4px;
      padding: 4px;
      border: 1px solid rgba(0, 0, 0, 0.05);

      &:hover {
        background-color: rgba(0, 0, 0, 0.06);
        color: rgba(0, 0, 0, 0.88);
      }
  }

  .inputContainer {
    padding-left: 8px;
  }  

  .container-chat-wrapper {
    height: calc(100vh - 64px);
    overflow: hidden;
    padding-bottom: 8px;
    background-color: white;    
    border: 0px;    

    .virtual-list-conversation {
      .ant-list-item {
        list-style: none;
        &::maker {
          display: none !important;
        }
      }
    }
    .container-chat-filter--text {
      display: flex;
      align-items: center;
      border-radius: 4px;
      padding: 4px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .container-chat-filter--text.active {
          color: #ff5629;
          border-color: #ff5629;
    }
    .container-chat-collapse {
      width: 100%;
      .container-chat-collapse--text {
          border-radius: 4px;
          padding: 6px 6px 7px 6px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
      &.active {
        .ant-collapse-expand-icon {
         color: #ff5629;
         }
         
         .container-chat-collapse--text {
          border-color: #ff5629;
          color: #ff5629;
        }
      }

      .ant-collapse-header {
        display: flex;
        align-items: center;
      }

      .ant-collapse-expand-icon {
        padding-inline-start: 4px !important;
      }

      .container-chat-collapse--action {
          border: 1px solid #ff5629;
          border-radius: 8px;

          .icon {
            cursor: pointer;
            font-size: 20px;
            color: #ff5629;
          }

          .icon--disabled {
            cursor: not-allowed !important;            
            color: #c4c4c4 !important;
          }
      }
    }

    .container-chat-action {
        padding: 16px;
        width: 100%;
    }
    
    .container-chat-list {
      margin-bottom: 10px;      
    }

  }
  
  .chat-message-wrapper {
    .btn-tag {
      height: 20px;
      width: 40px;
      border-bottom-right-radius: 0px;
      border-bottom-left-radius: 0px;
      border-color: #ff5629;
      margin-right: 2px;
    }

    .icon-add-tag {
      font-size: 12px;
      position: relative;
      bottom: 4px;
      color: #ff5629;      
    }

    .tag-message {
      border-bottom-right-radius: 0px;
      border-bottom-left-radius: 0px;
    }

    .ant-tag-close-icon {
      position: relative;
      top: 1px;
    }
  }

  .chat-information-wrapper {
    height: calc(100vh - 64px);
    overflow: hidden;    
    background-color: white;    
    border: 0px;    

    .chat-information-tabs {
      .ant-tabs-nav {
        width: 100% !important;
      }
      
      .ant-tabs-tab {
        display: block; /* centers text inside tabs */
        flex: 1;        
        text-align: center;
      }

      .ant-tabs-nav-operations {
        display: none !important;
      }
      
      .ant-tabs-nav > div:nth-of-type(1) {
        display: unset !important;
        width: 100% !important;
      }
    }

    .chat-tab-info {
      .ant-segmented {
        border-radius: 0px;
      }

      .chat-tab-info--icon {
        position: relative;
        top: 2px;
      }

      .ant-segmented-item-label {
        padding: 3px 0px;
      }
    }
  }

  .chat-message-wrapper {
    background-color: #eceff7;

    .message-list {
      .rce-mbox {
        background-color: rgba(254,246,240) !important;
        box-shadow: 1px 1px 1px 1px #e9e9e9;
      }
      .rce-mbox-left-notch, .rce-mbox-right-notch {
        fill: #fff6f0 !important;        
      }

      .rce-mbox-time-block {
        background: none !important;
        color: #00000073;
      }

      .ant-list-item {
        border-block-end: none !important;
        display: unset !important;
        padding: unset !important;
      }
    } 
  }

  .chat-list {
    .selected .rce-citem {
      background: #ECF4FF !important;
    }
  }
`