import { Button, Col, Flex, Row, Typography, Input, DatePicker, Select, Dropdown } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "querystring";
import { CloseOutlined, DownOutlined, FilterOutlined } from "@ant-design/icons";
import ProcessingListFilterDrawer from "./ProcessingListFilterDrawer";
import dayjs from "dayjs";
import _, { omit } from "lodash";
import Paragraph from "antd/es/typography/Paragraph";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { MenuProps } from "antd/lib/menu";
import { showAlert } from "utils/helper";
import ModalResult from "../dialogs/ModalResult";
import AssignPICBulkDialog from "../dialogs/AssignPICBulkDialog";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const ProcessingListFilter = ({ optionSmes, optionPIC, optionsWarehouse, ids, processingListCreatePickStepBulk, setIds }) => {
	const navigate = useNavigate();
	const location = useLocation()
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [searchText, setSearchText] = useState<string>(params?.q || "");
	const [dateRange, setDateRange] = useState<any>([dayjs().subtract(6, "day").startOf("day"), dayjs().startOf("day")]);
	const [showDrawer, setShowDrawer] = useState(false);
	const [showResult, setShowResult] = useState({
		show: false,
		errors: [],
		type: '',
		total: 0
	});
	const [showAssignBulk, setShowAssignBulk] = useState({
		show: false,
		type: ''
	})
	const { user } = useSelector(selectGlobalSlice);

	useEffect(() => {
		if (params?.gt && params?.lt) {
			setDateRange([dayjs.unix(Number(params.gt)), dayjs.unix(Number(params.lt))]);
		} else {
			setDateRange([dayjs().subtract(6, "day").startOf("day"), dayjs().startOf("day")]); // clear nếu URL không có param
		}
		if (params?.q) {
			setSearchText(String(params?.q || ""));
		}
	}, [params?.gt, params?.lt, params?.q]);

	const filterBlock = useMemo(() => {
		const blockWarehouse = optionsWarehouse?.filter((_option) => params?.warehouses?.split(",")?.some((param) => param == _option?.value));
		const blockUpS = optionSmes?.filter((_option) => params?.ups?.split(",")?.some((param) => param == _option?.value));
		const blockCreateBy = optionPIC?.filter((_option) => params?.createBy?.split(",")?.some((param) => param == _option?.value));

		return (
			<Flex style={{ gap: 10 }} wrap="wrap">
				{blockWarehouse?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 5,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`Kho vật lý: ${_.map(blockWarehouse, (item) => item.label)?.join(", ")}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 5 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "warehouses"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
				{blockUpS?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 5,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`UpS: ${_.map(blockUpS, (item) => item.label)?.join(", ")}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 5 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "ups"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
				{blockCreateBy?.length > 0 && (
					<Flex
						align="center"
						justify="between"
						style={{
							border: "1px solid #ff6d49",
							borderRadius: 20,
							background: "rgba(255,109,73, .1)",
							marginBottom: 4,
							padding: 5,
						}}
					>
						<Paragraph style={{ marginBottom: 0 }} ellipsis>{`Người tạo danh sách: ${_.map(blockCreateBy, (item) => item.label)?.join(", ")}`}</Paragraph>
						<CloseOutlined
							style={{ cursor: "pointer", marginLeft: 5 }}
							onClick={() => {
								navigate(
									`${location.pathname}?${queryString.stringify({
										..._.omit(params, "createBy"),
									})}`.replaceAll("%2C", ",")
								);
							}}
						/>
					</Flex>
				)}
			</Flex>
		);
	}, [params, optionSmes, optionsWarehouse, optionPIC]);

	const renderBulkAction = () => {
		const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
			if (key == 'assign') {
				setShowAssignBulk({
					show: true,
					type: 'assign'
				})
			}
			if (key == 'reAssign') {
				setShowAssignBulk({
					show: true,
					type: 'reAssign'
				})
			}
			if (key == 'create_pick_step') {
				let {data} = await processingListCreatePickStepBulk({
					variables: {
						ids: ids?.map(item => item?.id)
					}
				})
				if (data?.processingListCreatePickStepBulk?.data?.success) {
					if (data?.processingListCreatePickStepBulk?.data?.errors?.length == 0) {
						setIds([])
						showAlert.success('Tạo lộ trình cho danh sách xử lý thành công')
					} else {
						const dataErrors = data?.processingListCreatePickStepBulk?.data?.errors?.map(error => {
							const errorItem = ids?.find(item => item?.id == error?.id)
							return {
								...error,
								code: errorItem?.code
							}
						})
						setShowResult({
							show: true,
							errors: dataErrors,
							total: ids?.length,
							type: 'create_pick_step'
						})
					}
				} else {
					setIds([])
					showAlert.error(data?.processingListCreatePickStep?.data?.message || 'Tạo lộ trình cho danh sách xử lý thất bại')
				}
			}
		};
		const items: any = [
			{
				label: 'Tạo lộ trình',
				key: 'create_pick_step'
			},
			{
				label: 'Phân công nhân viên',
				key: 'assign'
			},
			{
				label: 'Phân công lại',
				key: 'reAssign'
			}
		];
		
		const menuProps = {
			items,
			onClick: handleMenuClick,
		};
		return (
			<Dropdown menu={menuProps} disabled={!ids?.length}>
				<Button className="btn-base color-base" type="primary">
					<Flex align="center" gap={4} justify="center">
						<Text style={{color: !ids?.length ? '#666' : '#fff'}}>Thao tác hàng loạt</Text>
						<DownOutlined style={{ fontSize: 10, color: !ids?.length ? '#666' : '#fff' }} />
					</Flex>
				</Button>
			</Dropdown>
		);
	}
	console.log(showResult)
	return (
		<>
			{showDrawer && (
				<ProcessingListFilterDrawer showDrawer={showDrawer} setShowDrawer={setShowDrawer} optionsWarehouse={optionsWarehouse} optionSmes={optionSmes} optionPIC={optionPIC} />
			)}
			{showResult?.show && <ModalResult 
				total={showResult?.total} 
				errors={showResult?.errors}
				type={showResult?.type}
				onHide={() => {
					setShowResult({
						show: false,
						errors: [],
						total: 0,
						type: ''
					})
					setIds([])
				}}
			/>}
			{showAssignBulk?.show && <AssignPICBulkDialog 
				 show={showAssignBulk?.show}
				 onHide={() => {
					setShowAssignBulk({
						show: false,
						type: ''
					})
				 }}
				 ids={ids}
				 optionPIC={optionPIC}
				 type={showAssignBulk?.type}
				 setShowResult={setShowResult}
			/>}
			<Row style={{ marginBottom: 20 }} gutter={10}>
				<Col span={8}>
					<Row align={"middle"}>
						<Col span={4}>
							<Text style={{ width: "100%" }}>Thời gian:</Text>
						</Col>
						<Col span={20}>
							<RangePicker
								className="custom-border"
								style={{ width: "100%", borderRadius: 0 }}
								value={dateRange as any}
								format={"DD/MM/YYYY"}
								onChange={(values: any) => {
									if (values && values.length === 2) {
										// Chọn range
										const [start, end] = values;
										navigate(
											`${location.pathname}?${queryString.stringify({
												...params,
												gt: start.startOf('day').unix(),
												lt: end.endOf('day').unix(),
											})}`
										);
										setDateRange(values);
									} else {
										navigate(`${location.pathname}?${queryString.stringify(omit(params, ["gt", "lt"]))}`);
									}
								}}
							/>
						</Col>
					</Row>
				</Col>

				<Col span={6}>
					<Select
						style={{ width: "100%" }}
						placeholder="Chọn nhân viên phụ trách"
						showSearch
						optionFilterProp="label"
						mode="multiple"
						onChange={(val) => {
							navigate(
								`${location.pathname}?${queryString.stringify({
									...params,
									staff: val.join(","),
								})}`.replaceAll("%2C", ",")
							);
						}}
						options={optionPIC}
						value={params?.staff ? params?.staff?.split(",")?.map((item) => item) : []}
					/>
				</Col>
			</Row>
			<Row style={{ marginBottom: 20 }} gutter={10}>
				<Col span={8}>
					<Input
						placeholder="Tìm kiếm mã danh sách"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const target = e.target as HTMLInputElement;
								navigate(
									`${location.pathname}?${queryString.stringify({
										...params,
										q: target.value,
									})}`.replaceAll("%2C", ",")
								);
							}
						}}
						style={{ borderRadius: 0 }}
						value={searchText}
						onChange={(e) => {
							setSearchText(e.target.value);
						}}
						onBlur={(e) => {
							navigate(
								`${location.pathname}?${queryString.stringify({
									...params,
									q: e.target.value,
								})}`.replaceAll("%2C", ",")
							);
						}}
					/>
				</Col>
				<Col span={6}>
					<Button
						type="default"
						style={{ width: "100%" }}
						onClick={() => {
							setShowDrawer(true);
						}}
					>
						<Flex align="center" justify="space-between" style={{ width: "100%" }}>
							<Text>Bộ lọc nâng cao</Text>
							<FilterOutlined />
						</Flex>
					</Button>
				</Col>
			</Row>
			<Row>{filterBlock}</Row>
			<Row justify="end">
				<Col span={16}>
					<Flex justify="start">
						{renderBulkAction()}
					</Flex>
				</Col>
				<Col span={8}>
					<Flex justify="end">
						<Button
							className="btn-base"
							type="primary"
							onClick={() => {
								navigate(`/${user?.category_code == 'fulfillment' ? 'outbound-manage' : "warehouse-manage"}/processing-create`);
							}}
						>
							Tạo danh sách
						</Button>
					</Flex>
				</Col>
			</Row>
		</>
	);
};

export default ProcessingListFilter;
