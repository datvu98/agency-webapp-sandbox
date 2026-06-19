import styled from "styled-components";

export const OperationWrapper = styled.div`

.progress-container {
  position: relative;
  width: 300px; /* Adjust this to your preferred width */
}

.progress-percent {
  position: absolute;
  width: 100%;
  text-align: center;
  color: white;
  font-weight: bold;
  top: 0; /* Adjust position */
}

.progress-percent.center {
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.progress-percent.left {
  top: 80%;
  left: 10%;
  transform: translate(-50%, -50%);
}
progress-percent.right {
  top: 80%;
  left: 90%;
  transform: translate(-50%, -50%);
}
.transparent-tabs .ant-tabs-ink-bar {
    height: 0px !important; 
}
`;

export const FullfillmentReportWrapper = styled.div`
.card-filter {
    & > .ant-card-body {
      padding: 18px 24px;
    }
  }

  .banner-wrapper {
    color: #666;
    text-align: left;
    background: '#fff';
    margin: 15px;
    border-radius: 4px;
    border: 1px solid #e5e8eb;
    padding: 10px 20px;
    cursor: pointer;
  }

  .banner-header {
    font-size: 13px;
    min-height: 35px;
    margin: 0;
  }

  .banner-header > span{
    display: inline-flex;
    margin-right: 10px;
  }

  .banner-statistic {
    font-size: 20px;
    font-weight: bold; 
    margin: 2px 0 0 0;
  }

  .banner-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .banner-footer > span {
    font-size: 13px;
  }

  .banner-wrapper:hover {
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  }
  .popover-wrapper {
    display: flex;
    justify-content: center;
    margin: 0 25px;
    align-items: center;
    position: relative;
  }

  .popover-img {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 10px;
  }

  .popover-title {
    display: flex;
    align-items: center;
  }

  .popover-title > span {
    display: inline-block;
  }

  .popover-title > div {
    position: absolute;
    right: 5px;
  }

  .popover-btn {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    background-color: #fa5528;
    color: #fff;
    margin-top: 10px;
    display: block;
    margin-left: auto;
    cursor: pointer;
  }
  .linechart-banner-wrapper {
    position: relative;
  }
  .banner-prev-btn,
  .banner-next-btn {
    background-color: white;
    position absolute;
    top: 80px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ff5629 !important;
    font-weight: bold;
    width: 35px !important;
    height: 35px !important;
    cursor: pointer;
    background: rgba(254, 86, 41, 0.1);
    border: none;
    line-height: 1;
  }
  .banner-next-btn {
    right: 20px;
  }

  .banner-prev-btn {
    left: 20px;
  }

  .banner-prev-btn:hover,
  .banner-next-btn:hover {
    background: rgba(254, 86, 41, 0.4);
  }
`;
