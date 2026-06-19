import styled from 'styled-components';

export default styled.div`
  .trigger {
    padding: 0 28px;
    font-size: 18px;
    line-height: 55px;
    cursor: pointer;
    transition: color 0.3s;
  }

  .trigger:hover {
      color: #F77F00;
  }

  .logo-wrapper {
      display: flex;
      justify-content: center;
  }

  .logo {
    height: 35px;
    text-align: center;   
    margin: 15px;    
  }

  .header_logo {
    font-weight: bold;
    font-size: 20px;
  }
            
  .ant-layout-header {
      height: 55px !important;
      line-height: 55px !important;  
  }
 .base-antd-menu {
    width: 240px;
    min-width: 240px !important;
  }
  .back-top-wrapper {
    -webkit-transition: all 0.4s;
    -moz-transition: all 0.4s;
    -ms-transition: all 0.4s;
    -o-transition: all 0.4s;    
    transition: all 0.4s;
    height: 50px;
    width: 50px;
    border-radius: 50%;
    background: #F77F00;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    box-shadow: 0px 0px 5px #0000003d;
    opacity: 0.3;
  }

  .back-top-wrapper:hover {    
    opacity: 1;
  }

  .layout-sider {
    overflow: auto;
    min-height: 100vh;
    position: fixed;
    left: 0px;
    top: 0px;
    bottom: 0px;
    background: #fff;    
  }

  .layout-sider-mobile {
    overflow: auto;
    min-height: 100vh;
    position: fixed;
    left: 0px;
    top: 55px;
    bottom: 0px;
    background: #fff;  
    border-right: 1px solid rgba(0, 0, 0, 0.05);
  }

  .site-layout-header {
    display: flex;
    padding-left: 5px;
    padding-right: 30px;
    justify-content: space-between;
    z-index: 99 !important;
  }

  .back-top {    
    font-weight: bold;
    font-size: 22px;
  }  

  .layout-content {
    margin-top: 55px;    
    overflow: initial;
    min-height: calc(100vh - 100px);    
  }

  #components-layout-demo-fixed-sider .logo {
    height: 32px;
    margin: 16px;
    background: rgba(255, 255, 255, 0.2);
  }

  .site-layout .site-layout-background {
    background: #fff;
    transition: all 0.2s;
    padding: 0px;
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

  @media (max-width: 400px) {
    .layout-sider {
      display: block;
      z-index: 10;
    }

    .layout-sider-mobile {
      display: none !important
    }

    .site-layout {      
      margin: 0 !important
    }
  }

`;

export const LayoutReportWrapper = styled.div`
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
    background-color: #eff2f5 !important;
    min-height: calc(100vh - 64px);
    padding: 20px;
    margin-left: 240px;

    .site-content {
      // margin-top: 20px;
    }
  }
`