import { SettingOutlined, MessageOutlined, LineChartOutlined, TruckOutlined, DollarOutlined, ShopOutlined, TagsOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { selectTotalUnread } from "app/pages/ChatPage/slice/selectors";
import queryString from "querystring";
import React, { useEffect, useMemo } from "react";
import { memo } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { selectGlobalSlice } from "app/slice/selectors";
import { hasPermissionAction } from "utils/helper";

interface SubMenuProps {
	link?: string;
	title?: string;
	key: string;
	label: string;
	hidden?: boolean;
}

interface MenuDataProps {
	key: string;
	label: string;
	icon?: any;
	link?: string;
	children?: Array<SubMenuProps>;
	permission?: string;
}

const { SubMenu, Item } = Menu;

const MenuLayout = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useSelector(selectGlobalSlice);
	console.log(user)
	const items: Array<MenuDataProps> = useMemo(() => {
		if (user?.category_code != 'fulfillment') {
			return [
				{
					key: "report",
					label: "Báo cáo",
					icon: <LineChartOutlined />,
					link: "/report",
					children: [
						{
							key: "report/overview",
							label: "Tổng quan",
							link: "/report/overview",
						},
						{
							key: "report/fullfillment-report",
							label: "Báo cáo Fulfillment",
							link: "/report/fullfillment-report",
						},
					],
				},
				{
					key: "fullfillment-manage",
					label: "Quản lý Fulfillment",
					icon: <TruckOutlined />,
					link: "/fullfillment-manage",
					children: [
						{
							key: "fullfillment-manage/operation",
							label: "Theo dõi vận hành",
							link: "/fullfillment-manage/operation",
						},
					],
				},
				{
					key: "warehouse-manage",
					label: "Quản lý kho",
					icon: <ShopOutlined />,
					link: "/warehouse-manage",
					children: [
						{
							key: "warehouse-manage/warehouse-list",
							label: "Danh sách kho",
							link: "/warehouse-manage/warehouse-list",
						},
						{
							key: "warehouse-manage/warehouse-bill-in",
							label: "Nhập kho",
							link: "/warehouse-manage/warehouse-bill-in",
						},
						{
							key: "warehouse-manage/warehouse-bill-out",
							label: "Xuất kho",
							link: "/warehouse-manage/warehouse-bill-out",
						},
						{
							key: "warehouse-manage/location-manage",
							label: "Quản lý vị trí",
							link: "/warehouse-manage/location-manage",
						},
						{
							key: "warehouse-manage/product-stock",
							label: "Tồn kho",
							link: "/warehouse-manage/product-stock",
						},
						{
							key: "warehouse-manage/processing-list",
							label: "Danh sách xử lý",
							link: "/warehouse-manage/processing-list",
						},
						{
							key: "warehouse-manage/pack-station",
							label: "Đóng gói hàng hoá",
							link: "/warehouse-manage/pack-station",
						},
						{
							key: "warehouse-manage/label-packing",
							label: "Đóng gói vận đơn",
							link: "/warehouse-manage/label-packing",
						},
						{
							key: "warehouse-manage/hand-over-list",
							label: "Quản lý bàn giao",
							link: "/warehouse-manage/hand-over-list",
						},
						{
							key: "warehouse-manage/restock",
							label: "Lưu kho hàng huỷ",
							link: "/warehouse-manage/restock",
						},
					],
				},
				{
					key: "chats_setting",
					label: "Quản lý trò chuyện",
					icon: <MessageOutlined />,
					permission: "customer_service_chat",
					link: "/chats",
					children: [
						{
							key: "chats",
							label: "Trò chuyện",
							link: "/chats",
						},
					],
				},
				{
					key: "campaign_manage",
					label: "Quản lý tiếp thị liên kết",
					icon: <TagsOutlined />,
					permission: "",
					link: "/campaign-manage",
					children: [
						{
							key: "campaign-manage/list-campaign",
							label: "Danh sách chiến dịch",
							link: "/campaign-manage/list-campaign",
						},
					],
				},
				{
					key: "settings",
					label: "Cấu hình",
					icon: <SettingOutlined />,
					link: "/settings",
					children: !user?.is_subuser
						? [
							{
								key: "settings/user",
								label: "Tài khoản",
								link: "/settings/user",
							},
							{
								key: "settings/smes",
								label: "Quản lý UpS",
								link: "/settings/smes",
							},
							{
								key: "settings/connect-ups",
								label: "Kết nối UpS",
								link: "/settings/connect-ups",
							},
							{
								key: "settings/sub-user",
								label: "Phân quyền tài khoản phụ",
								link: "/settings/sub-user",
							},
							{
								key: "settings/partner-connect",
								label: "Kết nối tài khoản Partner",
								link: "/settings/partner-connect",
							},
							{
								key: "settings/cms",
								label: "CMS",
								link: "/settings/cms",
								hidden: true,
							},
							{
								key: "settings/cms-create",
								label: "CMS",
								link: "/settings/cms-create",
								hidden: true,
							},
						]
						: [
							{
								key: "settings/smes",
								label: "Quản lý UpS",
								link: "/settings/smes",
							},
						],
				},
			]
		}
		return [
			{
				key: "report",
				label: "Báo cáo",
				icon: <LineChartOutlined />,
				link: "/report",
				children: [
					{
						key: "report/overview",
						label: "Tổng quan",
						link: "/report/overview",
					},
					{
						key: "report/fullfillment-report",
						label: "Báo cáo hạn SLA",
						link: "/report/fullfillment-report",
					},
				],
			},
			{
				key: "inventory-counting",
				label: "Kiểm kê",
				icon: <LoginOutlined />,
				link: '/inventory-counting',
				children: [
					{
						key: "inventory-counting/list",
						label: "Kiểm kê thường nhật",
						link: "/inventory-counting/list",
					},
				],
			},
			{
				key: "warehouse-manage",
				label: "Quản lý kho",
				icon: <ShopOutlined />,
				link: "/warehouse-manage",
				children: [
					{
						key: "warehouse-manage/product-stock",
						label: "Tồn kho",
						link: "/warehouse-manage/product-stock",
					},
					{
						key: "warehouse-manage/location-manage",
						label: "Quản lý vị trí",
						link: "/warehouse-manage/location-manage",
					},
					{
						key: "warehouse-manage/warehouse-list",
						label: "Danh sách kho",
						link: "/warehouse-manage/warehouse-list",
					},
					{
						key: "warehouse-manage/return-receipt",
						label: "Nhận hoàn trả",
						link: "/warehouse-manage/return-receipt",
					},
				],
			},
			{
				key: "inbound-manage",
				label: "Vận hành nhập",
				icon: <LoginOutlined />,
				link: "/inbound-manage",
				children: [
					{
						key: "inbound-manage/warehouse-bill-in",
						label: "Quản lý phiếu nhập",
						link: "/inbound-manage/warehouse-bill-in",
					},
					{
						key: "inbound-manage/restock",
						label: "Lưu kho hàng huỷ",
						link: "/inbound-manage/restock",
					},
				],
			},
			{
				key: "outbound-manage",
				label: "Vận hành xuất",
				icon: <LogoutOutlined />,
				link: "/outbound-manage",
				children: [
					{
						key: "outbound-manage/operation",
						label: "Theo dõi đơn xuất",
						link: "/outbound-manage/operation",
					},
					{
						key: "outbound-manage/warehouse-bill-out",
						label: "Quản lý phiếu xuất",
						link: "/outbound-manage/warehouse-bill-out",
					},
					{
						key: "outbound-manage/processing-list",
						label: "Danh sách xử lý",
						link: "/outbound-manage/processing-list",
					},
					{
						key: "outbound-manage/pack-station",
						label: "Đóng gói hàng hoá",
						link: "/outbound-manage/pack-station",
					},
					{
						key: "outbound-manage/label-packing",
						label: "Đóng gói vận đơn",
						link: "/outbound-manage/label-packing",
					},
					{
						key: "outbound-manage/hand-over-list",
						label: "Bàn giao xuất hàng",
						link: "/outbound-manage/hand-over-list",
					},
				],
			},
			{
				key: "settings",
				label: "Quản lý tài khoản",
				icon: <SettingOutlined />,
				link: "/settings",
				children: !user?.is_subuser
					? [
						{
							key: "settings/user",
							label: "Tài khoản",
							link: "/settings/user",
						},
						{
							key: "settings/smes",
							label: "Quản lý UpS",
							link: "/settings/smes",
						},
						{
							key: "settings/connect-ups",
							label: "Kết nối UpS",
							link: "/settings/connect-ups",
						},
						{
							key: "settings/sub-user",
							label: "Quản lý tài khoản phụ",
							link: "/settings/sub-user",
						},
					]
					: [
						{
							key: "settings/smes",
							label: "Quản lý UpS",
							link: "/settings/smes",
						},
					],
			},
		]
	}, [user]);

	const getSelectedKeys = () => {
		const pathSnippets = location.pathname.split("/").filter((i) => i);
		const matchedKeys = items.reduce((keys, item) => {
			if (item?.children) {
				item?.children.forEach((child) => {
					if (location.pathname.includes(child.link || "")) {
						keys.push(child.key);
					}
				});
			} else if (location.pathname.includes(item.link || "")) {
				keys.push(item.key);
			}
			return keys;
		}, [] as string[]);
		return matchedKeys.length ? matchedKeys : [location.pathname];
	};

	return (
		<>
			<Menu
				theme="light"
				mode="inline"
				items={items}
				selectedKeys={getSelectedKeys()}
				defaultOpenKeys={["chat"]}
				onClick={(e) => {
					if (e.key == "customers") {
						window.open(`${process.env.REACT_APP_SME_ENDPOINT}/customer-service/customer-info`, "_blank");
					} else {
						navigate(`/${e.key}`);
					}
				}}
			/>
			<span style={{ position: "fixed", bottom: 10, left: 24 }}>
				Phiên bản: <strong>{process.env.REACT_APP_VERSION}</strong>
			</span>
		</>
	);
};

export default memo(MenuLayout);
