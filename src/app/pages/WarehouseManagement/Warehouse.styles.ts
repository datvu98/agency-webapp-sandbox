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

export const WarehouseListWraper = styled.div`
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
		height: 32px !important;
	}
`;

export const ProcessingListWrapper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button {
		border-radius: 0px;
	}
`;

export const ProcessingCreateWrapper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button {
		border-radius: 0px;
	}
`;
export const ProcessingDetailWrapper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button {
		border-radius: 0px;
	}
`;

export const WarehouseBillInWrapper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button {
		border-radius: 0px;
	}
`;

export const WarehouseBillOutWrapper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button {
		border-radius: 0px;
	}
`;

export const WarehouseBillInDetailWrapper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button {
		border-radius: 0px;
	}
`;

export const WarehouseBillOutDetailWrapper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button {
		border-radius: 0px;
	}
`;

export const PackingDetailWrapper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button,
	.custom-border,
	.custom-border .ant-select-selector {
		border-radius: 0px;
	}
	
.row-active {
  background-color: #fef1ce !important;
  transition: all 0.2s ease;
}

.setting-table .ant-table-tbody > tr {
  transition: all 0.2s ease;
}

.setting-table .ant-table-tbody > tr.row-active > td > span,
.setting-table .ant-table-tbody > tr.row-active > td > div {
	font-size: 18px !important;
}

.scan-note {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 8px 12px;
  margin-top: 12px;

  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  cursor: pointer;

}

.scan-note__icon {
  color: #faad14;¥
  font-size: 16px;
}

.scan-note__text {
  color: #262626;
  font-size: 14px;
}


`;

export const HandOverWrapper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button,
	.custom-border,
	.custom-border .ant-select-selector {
		border-radius: 0px;
	}
`;

export const ReturnReceiptWraper = styled.div`
	.custom-border div,
	.custom-border .ant-input-group-addon button,
	.custom-border,
	.custom-border .ant-select-selector {
		border-radius: 0px;
	}
`;
