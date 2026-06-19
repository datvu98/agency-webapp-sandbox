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