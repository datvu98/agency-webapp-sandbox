import React, { memo, useMemo, useState } from "react";
import { Modal, Button, Select, Spin } from "antd";
import { useMutation } from "@apollo/client";
import mutate_processingListAssign from "graphql/mutations/mutate_processingListAssign";
import { showAlert } from "utils/helper";
import mutate_processingListReAssign from "graphql/mutations/mutate_processingListReAssign";

interface AssignPICDialogProps {
	show: boolean;
	onHide: () => void;
	id?: number;
	optionPIC?: any;
	type?: string
}

const AssignPICDialog: React.FC<AssignPICDialogProps> = memo(({ show, onHide, id, optionPIC, type }) => {
	const [pic, setPIC] = useState<any>(null);

	const [processingListAssign, { loading: loadingProcessingListAssign }] = useMutation(mutate_processingListAssign, {
		awaitRefetchQueries: true,
		refetchQueries: ["processingListListWithPagination", "processingListStatusCount", 'processingListGetById'],
	});
	const [processingListReAssign, { loading: loadingProcessingListReAssign }] = useMutation(mutate_processingListReAssign, {
		awaitRefetchQueries: true,
		refetchQueries: ["processingListListWithPagination", "processingListStatusCount", 'processingListGetById'],
	});

	const mutationQuery = useMemo(() => {
		if(type == 'reAssign') {
			return processingListReAssign
		}
		return processingListAssign
	}, [type])
	const handleSubmit = async () => {
		let { data } = await mutationQuery({
			variables: {
				id: id,
				picId: pic?.picType == 1 ? Number(pic?.id) : Number(pic?.picId),
				picType: pic?.picType,
			},
		});
		if (data?.[`${type == 'reAssign' ? 'processingListReAssign' : 'processingListAssign'}`]?.success) {
			showAlert.success("Phân công nhân viên thành công");
			onHide();
		} else {
			showAlert.error(data?.[`${type == 'reAssign' ? 'processingListReAssign' : 'processingListAssign'}`]?.message || "Phân công nhân viên thất bại");
		}
	};
	return (
		<Modal open={show} centered onCancel={onHide} footer={null} destroyOnClose title="Phân công nhân viên">
			<Spin spinning={loadingProcessingListAssign || loadingProcessingListReAssign}>
				<Select
					style={{ width: "100%" }}
					placeholder="Chọn nhân viên xử lý"
					showSearch
					optionFilterProp="label"
					allowClear
					onChange={(val, option: any) => {
						if (!!val) {
							if (!!option?.is_subuser) {
								setPIC({
									picId: option?.value,
									picType: 0,
								});
							} else {
								setPIC({
									id: Number(option?.value?.split('_')?.[1]),
									picId: option?.value,
									picType: 1,
								});
							}
						} else {
							setPIC(null);
						}
					}}
					options={optionPIC}
					value={pic?.picId}
				/>
				<div style={{ textAlign: "center", padding: "12px 8px" }}>
					<div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12 }}>
						<Button onClick={onHide} style={{ width: 120 }} className="btn-base">
							Huỷ
						</Button>
						<Button type="primary" disabled={!pic} onClick={handleSubmit} style={{ width: 120 }} className="btn-base">
							Đồng ý
						</Button>
					</div>
				</div>
			</Spin>
		</Modal>
	);
});

export default AssignPICDialog;
