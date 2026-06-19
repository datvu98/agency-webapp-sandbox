import { useMutation, useQuery } from "@apollo/client";
import { Button, Checkbox, Col, Form, Modal, Row, Select, Space } from "antd";
import React, { useMemo, useState } from "react";
import mutate_inventoryCountingAddByLocation from "graphql/mutations/mutate_inventoryCountingAddByLocation";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import { showAlert } from "utils/helper";

interface Props {
	open: boolean;
	recordId: number;
	warehouseId: number;
	onClose: () => void;
	onSuccess: () => void;
}

const AddByLocationDialog = ({ open, recordId, warehouseId, onClose, onSuccess }: Props) => {
	const [form] = Form.useForm();
	const [selectedRack, setSelectedRack] = useState<number | undefined>(undefined);
	const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

	const selectedArea = Form.useWatch("areaId", form);

	const { data: areaData, loading: loadingArea } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "area", isActive: true },
		fetchPolicy: "cache-and-network",
		skip: !open,
	});

	const { data: rackData, loading: loadingRack } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "rack", isActive: true, areaId_in: [selectedArea] },
		fetchPolicy: "cache-and-network",
		skip: !open || !selectedArea,
	});

	const { data: slotData, loading: loadingSlot } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "slot", isActive: true, areaId_in: [selectedArea], rackId_in: [selectedRack] },
		fetchPolicy: "cache-and-network",
		skip: !open || !selectedArea || !selectedRack,
	});

	const optionArea = useMemo(
		() =>
			(areaData?.locationManagerList?.data ?? []).map((i: any) => ({
				label: i?.code,
				value: i?.id,
			})),
		[areaData]
	);

	const optionRack = useMemo(
		() =>
			(rackData?.locationManagerList?.data ?? []).map((i: any) => ({
				label: i?.code,
				value: i?.id,
			})),
		[rackData]
	);

	const slotList = useMemo(
		() =>
			(slotData?.locationManagerList?.data ?? []).map((i: any) => ({
				label: i?.code,
				value: i?.id,
			})),
		[slotData]
	);

	const allSlotIds = useMemo(() => slotList?.map((s) => s?.value), [slotList]);
	const isAllSelected = slotList?.length > 0 && selectedSlots?.length === slotList?.length;

	const toggleSelectAll = () => {
		setSelectedSlots(isAllSelected ? [] : allSlotIds);
	};

	const [add, { loading }] = useMutation(mutate_inventoryCountingAddByLocation, {
		onCompleted: (data) => {
			const result = data?.inventoryCountingAddByLocation;
			if (result?.success) {
				showAlert.success(`Đã thêm ${result?.data?.addedCount ?? 0} vị trí`);
				onSuccess();
			} else {
				showAlert.error(result?.message ?? "Thêm vị trí thất bại");
			}
		},
		onError: () => showAlert.error("Thêm vị trí thất bại"),
	});

	const handleOk = async () => {
		const values = await form.validateFields();
		add({
			variables: {
				input: {
					recordId,
					rackId: values?.rackId,
					locationIds: selectedSlots?.length ? selectedSlots : undefined,
				}
			},
		});
	};

	const handleClose = () => {
		form?.resetFields();
		setSelectedRack(undefined);
		setSelectedSlots([]);
		onClose();
	};

	return (
		<Modal
			open={open}
			title="Thêm nhanh theo vị trí"
			onCancel={handleClose}
			width={560}
			footer={
				<Space>
					<Button onClick={handleClose}>Huỷ</Button>
					<Button type="primary" loading={loading} onClick={handleOk}>
						Thêm
					</Button>
				</Space>
			}
		>
			<Form form={form} layout="vertical">
				<Form.Item
					name="areaId"
					label="Khu vực"
					rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
				>
					<Select
						placeholder="Chọn khu vực"
						loading={loadingArea}
						options={optionArea}
						showSearch
						optionFilterProp="label"
						onChange={() => {
							form?.setFieldsValue({ rackId: undefined });
							setSelectedRack(undefined);
							setSelectedSlots([]);
						}}
					/>
				</Form.Item>

				<Form.Item
					name="rackId"
					label="Kệ"
					rules={[{ required: true, message: "Vui lòng chọn kệ" }]}
				>
					<Select
						placeholder="Chọn kệ"
						loading={loadingRack}
						options={optionRack}
						showSearch
						optionFilterProp="label"
						disabled={!selectedArea}
						onChange={(val) => {
							setSelectedRack(val);
							setSelectedSlots([]);
						}}
					/>
				</Form.Item>

				{selectedRack && (
					<Form.Item label="Vị trí">
						<div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ fontSize: 13, color: "#888" }}>
								{loadingSlot ? "Đang tải..." : `${slotList?.length ?? 0} vị trí`}
							</span>
							{(slotList?.length ?? 0) > 0 && (
								<Button size="small" type="link" onClick={toggleSelectAll} style={{ padding: 0 }}>
									{isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
								</Button>
							)}
						</div>
						<div
							style={{
								maxHeight: 200,
								overflowY: "auto",
								border: "1px solid #d9d9d9",
								borderRadius: 6,
								padding: "8px 12px",
							}}
						>
							<Row gutter={[8, 8]}>
								{slotList?.map((slot) => (
									<Col span={8} key={slot?.value}>
										<Checkbox
											checked={selectedSlots?.includes(slot?.value)}
											onChange={(e) => {
												setSelectedSlots(
													e?.target?.checked
														? [...selectedSlots, slot?.value]
														: selectedSlots?.filter((id) => id !== slot?.value)
												);
											}}
										>
											{slot?.label}
										</Checkbox>
									</Col>
								))}
							</Row>
						</div>
					</Form.Item>
				)}
			</Form>
		</Modal>
	);
};

export default AddByLocationDialog;
