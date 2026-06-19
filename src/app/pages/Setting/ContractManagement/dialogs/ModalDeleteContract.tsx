import { Modal, Space, Button } from "antd";
import React from "react";
import mutate_vrDeleteCmsContract from "graphql/mutations/mutate_vrDeleteCmsContract";
import { useMutation } from "@apollo/client";
import { showAlert } from "utils/helper";

const ModalDeleteContract = ({ onHide, show, smeId, contractId }) => {
    const [vrDeleteCmsContract, { loading: loadingVrDeleteCmsContract }] = useMutation(mutate_vrDeleteCmsContract, {
        awaitRefetchQueries: true,
        refetchQueries: ["vrCmsContracts"],
    })

    const handleSubmit = async () => {
        try {
            let { data } = await vrDeleteCmsContract({
                variables: {
                    id: contractId,
                    sme_id: smeId,
                }
            })

            if (data?.vrDeleteCmsContract?.success) {
                showAlert.success("Xoá hợp đồng thành công");
                onHide();
            } else {
                showAlert.error(data?.vrDeleteCmsContract?.message || "Xoá hợp đồng thất bại")
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Modal
            open={show}
            onCancel={onHide}
            centered
            width={600}
            footer={null}
            title="Xác nhận xoá hợp đồng"
            destroyOnClose
        >
            <Space style={{ width: "100%", justifyContent: "end", marginTop: 10 }}>
                <Button onClick={onHide} className="btn-base">
                    Huỷ
                </Button>
                <Button 
                    type="primary" 
                    className="btn-base" 
                    htmlType="submit"
                    onClick={handleSubmit}
                    loading={loadingVrDeleteCmsContract}
                >
                    Xác nhận xoá
                </Button>
            </Space>
        </Modal>
    )
};

export default ModalDeleteContract;
