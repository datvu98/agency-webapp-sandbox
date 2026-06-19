import React from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";
import { useMutation } from "@apollo/client";
import { showAlert } from "utils/helper";
import mutate_upsertWorkStation from "graphql/mutations/mutate_upsertWorkStation";

interface ModalCreatePackStationProps {
    show: boolean;
}

const ModalCreatePackStation: React.FC<ModalCreatePackStationProps> = ({ show }) => {
    const [form] = Form.useForm();

    const [upsertWorkStation, {loading: loadingUpsertWorkStation}] = useMutation(mutate_upsertWorkStation, {
        awaitRefetchQueries: true,
        refetchQueries: ['getLastWorkStationByCurrentUser']
    })
    const handleSubmit = async (values: any) => {
        try {
            const { data } = await upsertWorkStation({
                variables: {
                    upserted: {
                        name: values.name?.trim(),
                    },
                },
            });

            if (data?.upsertWorkStation?.success) {
                showAlert.success("Thêm trạm đóng gói thành công.");
                form.resetFields();
            } else {
                showAlert.error(data?.locationManagerCreate?.message || "Thêm trạm đóng gói thất bại.");
            }
        } catch (err) {
            showAlert.error("Đã xảy ra lỗi khi thêm trạm đóng gói.");
        }
    };

    return (
        <Modal open={show} title={"Thêm mới trạm đóng gói"} footer={null} centered>
            <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{}}>
                <Form.Item
                    name="name"
                    label={"Điền trạm đóng gói"}
                    required
                    rules={[
                        { required: true, message: "Vui lòng nhập trạm đóng gói" },
                        { max: 15, message: "Trạm đóng gói tối đa 15 ký tự" },
                        {
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                if (value.trim().length !== value.length) {
                                    return Promise.reject("Trạm đóng gói không được có dấu cách ở đầu hoặc cuối");
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Input maxLength={125} placeholder={"Nhập thông tin trạm đóng gói"} size="large" />
                </Form.Item>
                <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit" className="btn-base" loading={loadingUpsertWorkStation} style={{ width: 100 }}>
                        Cập nhật
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalCreatePackStation;
