import styled from "styled-components";

export const SettlementWrapper = styled.div`
.custom-select .ant-select-selector {
  border-radius: 0px;
}

.custom-search .ant-input-affix-wrapper {
  border-radius: 0px !important;
}

.custom-tab .ant-tabs-nav {
  margin-bottom: 0 !important;
}

.table-borderless th,
.table-borderless td,
.table-borderless thead th,
.table-borderless tbody + tbody {
  border: 0;
}

.table {
  width: 100%;
  margin-bottom: 1rem;
  color: #000000;
  background-color: transparent;
  border-collapse: collapse !important;
}

.table.table-vertical-center th, .table.table-vertical-center td {
  vertical-align: middle;
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: top;
  border-top: 1px solid #ebedf3;
}
.table thead th {
  vertical-align: bottom;
  
  border-bottom: 2px solid #ebedf3;
}
.table tbody + tbody {
  border-top: 2px solid #ebedf3;
}
.table thead th, .table thead td {
  font-weight: 600;
  font-size: 1rem;
  border-bottom-width: 1px;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.anticon {
  vertical-align: -2px !important;
}
`;

