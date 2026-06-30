import React, { memo, useMemo, useState } from "react";
import { Modal, Button, Select, Spin } from "antd";
import { useMutation } from "@apollo/client";
import mutate_processingListAssign from "graphql/mutations/mutate_processingListAssign";
import { showAlert } from "utils/helper";
import mutate_processingListReAssign from "graphql/mutations/mutate_processingListReAssign";
import mutate_processingListAssignBulk from "graphql/mutations/mutate_processingListAssignBulk";
import mutate_processingListReAssignBulk from "graphql/mutations/mutate_processingListReAssignBulk";

interface AssignPICBulkDialogProps {
    show: boolean;
    onHide: () => void;
    ids?: any;
    optionPIC?: any;
    type?: string,
    setShowResult: any
}

const AssignPICBulkDialog: React.FC<AssignPICBulkDialogProps> = memo(({ show, onHide, ids, optionPIC, type, setShowResult }) => {
    const [pic, setPIC] = useState<any>(null);

    const [processingListAssignBulk, { loading: loadingProcessingListAssignBulk }] = useMutation(mutate_processingListAssignBulk, {
        awaitRefetchQueries: true,
        refetchQueries: ["processingListListWithPagination", "processingListStatusCount", 'processingListGetById'],
    });
    const [processingListReAssignBulk, { loading: loadingProcessingListReAssignBulk }] = useMutation(mutate_processingListReAssignBulk, {
        awaitRefetchQueries: true,
        refetchQueries: ["processingListListWithPagination", "processingListStatusCount", 'processingListGetById'],
    });

    const mutationQuery = useMemo(() => {
        if(type == 'reAssign') {
            return processingListReAssignBulk
        }
        return processingListAssignBulk
    }, [type])
    const handleSubmit = async () => {
        let { data } = await mutationQuery({
            variables: {
                ids: ids?.map(item => item?.id),
                picId: pic?.picType == 1 ? Number(pic?.id) : Number(pic?.picId),
                picType: pic?.picType,
            },
        });
        if (data?.[`${type == 'reAssign' ? 'processingListReAssignBulk' : 'processingListAssignBulk'}`]?.data?.success) {
            if (data?.[`${type == 'reAssign' ? 'processingListReAssignBulk' : 'processingListAssignBulk'}`]?.data?.errors?.length == 0) {
                showAlert.success("Phân công nhân viên hàng loạt thành công");
            } else {
                const dataErrors = data?.[`${type == 'reAssign' ? 'processingListReAssignBulk' : 'processingListAssignBulk'}`]?.data?.errors?.map(error => {
                    const errorItem = ids?.find(item => item?.id == error?.id)
                    return {
                        ...error,
                        code: errorItem?.code
                    }
                })
                setShowResult({
                    show: true,
                    type: type,
                    total: ids?.length,
                    errors: dataErrors
                })
            }
            onHide();
        } else {
            showAlert.error(data?.[`${type == 'reAssign' ? 'processingListReAssignBulk' : 'processingListAssignBulk'}`]?.data?.message || "Phân công nhân viên hàng loạt thất bại");
        }
    };
    return (
        <Modal open={show} centered onCancel={onHide} footer={null} destroyOnClose title="Phân công nhân viên">
            <Spin spinning={loadingProcessingListAssignBulk || loadingProcessingListReAssignBulk}>
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

export default AssignPICBulkDialog;
