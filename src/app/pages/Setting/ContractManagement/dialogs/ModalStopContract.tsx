import { Modal, Space, Button, Typography, Tooltip, Flex, Input, Form } from "antd";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { InfoCircleOutlined } from "@ant-design/icons";
import mutate_vrStopCmsContract from "graphql/mutations/mutate_vrStopCmsContract";
import { showAlert } from "utils/helper";
import ModalConfirm from "./ModalConfirm";

const { Text } = Typography;
const { TextArea } = Input;

const ModalStopContract = ({ onHide, show, smeId, contractId }) => {
    const [form] = Form.useForm();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [vrStopCmsContract, { loading: loadingVrStopCmsContract }] = useMutation(
        mutate_vrStopCmsContract,
        {
            awaitRefetchQueries: true,
            refetchQueries: ["vrCmsContracts"],
        }
    );

    const handleSubmit = async () => {
        const values = form.getFieldsValue();

        try {
            const { data } = await vrStopCmsContract({
                variables: {
                    sme_id: smeId,
                    note: values.note,
                    id: contractId,
                },
            });

            if (data?.vrStopCmsContract?.success) {
                showAlert.success(data?.vrStopCmsContract?.message || "Dừng hợp đồng thành công.");
                setConfirmOpen(false);
                onHide();
            } else {
                showAlert.error(data?.vrStopCmsContract?.message || "Dừng hợp đồng thất bại.");
            }
        } catch (error) {
            showAlert.error("Có lỗi xảy ra khi dừng hợp đồng.");
        }
    };

    const handleOpenConfirm = () => {
        form
            .validateFields()
            .then(() => {
                setConfirmOpen(true);
            })
            .catch(() => {
            });
    };

    return (
        <>
            {confirmOpen && <ModalConfirm
                open={confirmOpen}
                title="Xác nhận dừng hợp đồng"
                content="Bạn có chắc chắn muốn dừng hợp đồng này không?"
                onCancel={() => setConfirmOpen(false)}
                onOk={handleSubmit}
                loading={loadingVrStopCmsContract}
            />}

            <Modal
                open={show}
                onCancel={onHide}
                centered
                width={600}
                footer={null}
                title="Dừng hợp đồng"
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Flex gap={4} align="center" style={{ marginTop: 12 }}>
                        <Text>Lý do dừng hợp đồng</Text>
                        <Tooltip placement="topLeft" title="Hợp đồng sẽ được coi là có hiệu lực đến hết ngày hôm nay">
                            <InfoCircleOutlined style={{ color: "#1677ff" }} />
                        </Tooltip>
                    </Flex>

                    <Form.Item
                        name="note"
                        rules={[
                            { required: true, message: "Vui lòng nhập lý do dừng hợp đồng" },
                            {
                                validator: (_, value) => {
                                    if (value && value.trim().length === 0)
                                        return Promise.reject("Lý do không được chỉ gồm dấu cách");
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <TextArea
                            placeholder="Dừng hợp đồng"
                            rows={3}
                            maxLength={255}
                            showCount
                            style={{ marginTop: 6 }}
                        />
                    </Form.Item>

                    <Space style={{ width: "100%", justifyContent: "end", marginTop: 12 }}>
                        <Button onClick={onHide}>Huỷ</Button>
                        <Button type="primary" onClick={handleOpenConfirm}>
                            Xác nhận
                        </Button>
                    </Space>
                </Form>
            </Modal>
        </>
    );
};

export default ModalStopContract;
