import React, { memo, useMemo } from "react";
import { Modal, Progress, Typography, Space, Spin } from "antd";

const { Title, Text } = Typography;

interface ModalProgressProps {
    show: boolean;
    processedItems: any[];
    selected: any[];
}

const ModalProgress: React.FC<ModalProgressProps> = memo(
    ({ show, processedItems = [], selected = [] }) => {
        const percent = useMemo(() => {
            if (!selected.length) return 0;
            return Math.round((processedItems.length / selected.length) * 100);
        }, [processedItems, selected]);

        const completed = percent >= 100;

        return (
            <Modal
                open={show}
                centered
                closable={false}
                maskClosable={false}
                footer={null}
                width={500}
            >
                <Space
                    direction="vertical"
                    size={24}
                    style={{
                        width: "100%",
                        textAlign: "center",
                        padding: "16px 8px",
                    }}
                >
                    {!completed && <Spin size="large" />}

                    <div>
                        <Title level={4} style={{ marginBottom: 8 }}>
                            {completed
                                ? "Hoàn thành xử lý bàn giao"
                                : "Đang tạo phiên bàn giao"}
                        </Title>

                        <Text type="secondary">
                            {completed
                                ? "Tất cả kiện hàng đã được xử lý."
                                : "Vui lòng không đóng trình duyệt trong quá trình xử lý."}
                        </Text>
                    </div>

                    <Progress
                        percent={percent}
                        size="default"
                        status={completed ? "success" : "active"}
                        strokeLinecap="round"
                        strokeColor="#ff5628"
                        format={() =>
                            `${processedItems.length}/${selected.length}`
                        }
                    />

                    <div>
                        <Text strong>
                            Đã xử lý {processedItems.length} / {selected.length} kiện hàng
                        </Text>
                    </div>
                </Space>
            </Modal>
        );
    }
);

export default ModalProgress;