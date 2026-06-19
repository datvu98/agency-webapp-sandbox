import {
    Spin,
    Table,
    MenuProps,
    Dropdown,
    Flex,
    Button,
    Typography,
    Popover,
    Image,
    Tooltip,
} from "antd";
import { DownOutlined, CheckCircleFilled, WarningFilled } from "@ant-design/icons";
import Pagination from "app/components/Pagination";
import React, { useState } from "react";
import dayjs from "dayjs";
import { CONTRACT_STATUS_OPTIONS } from "../constants";
import { useLocation, useNavigate } from "react-router-dom";
import ModalDetailContract from "../dialogs/ModalDetailContract";
import { ShowDetailType } from "../types";
import ModalDeleteContract from "../dialogs/ModalDeleteContract";
import { showAlert } from "utils/helper";
import { CONTRACT_MESSAGES } from "../constants";
import ModalStopContract from "../dialogs/ModalStopContract";

const { Text } = Typography;

const ContractManagementTable = ({ id, optionsStore, dataTable, dataPagination }) => {
    const location = useLocation();
    const params = new URLSearchParams(location?.search);
    const navigate = useNavigate();
    const [showDetailContract, setShowDetailContract] = useState<ShowDetailType>({
        show: false,
        contract: null
    });
    
    const [showDeleteModal, setShowDeleteModal] = useState<ShowDetailType>({
        show: false,
        contract: null,
    });

    const [showStopModal, setShowStopModal] = useState<ShowDetailType>({
        show: false,
        contract: null,
    });

    const getContractStatusLabel = (status: number): string => {
        const found = CONTRACT_STATUS_OPTIONS.find(x => x?.value === status);
        return found?.label || "--";
    };

    const apiPage = dataPagination?.current_page || 1;
    const apiLimit = dataPagination?.per_page || 25;
    const totalPage = dataPagination?.total_pages || 1;
    const totalRecord = dataPagination?.total || 0;

    const page = Number(params.get("page")) || apiPage;
    const limit = Number(params.get("limit")) || apiLimit;

    // const validateContractAction = (status: number, action: string) => {
    //     const isActive = status === 2;
    //     const isEnded = status === 3;

    //     if (action === "config_cms") {
    //         if (isEnded) {
    //             return CONTRACT_MESSAGES.CMS_ENDED_BLOCK;
    //         }
    //         return null;
    //     }

    //     if (["delete"].includes(action)) {
    //         if (isActive) return CONTRACT_MESSAGES.ACTIVE_BLOCK;
    //         if (isEnded) return CONTRACT_MESSAGES.ENDED_BLOCK;
    //     }

    //     if (action === "stop") {
    //         if (!isActive) return CONTRACT_MESSAGES.STOP_BLOCK; 
    //     }

    //     return null;
    // };

    const columns = [
        {
            title: "Tên hợp đồng",
            dataIndex: "title",
            with: 200,
        },
        {
            title: "Số lượng gian hàng áp dụng",
            dataIndex: "store_ids",
            with: 100,
            align: "center",
            render: (storeIds) => {
                if (!storeIds || storeIds.length === 0) return 0;

                const contentStores = (
                    <Flex vertical>
                        {storeIds.map((id) => {
                            const storeInfo = optionsStore?.find((opt) => opt?.id === id);
                            
                            if (!storeInfo) return null;

                            const storeName = storeInfo?.name;
                            const storeLogo = storeInfo?.channel?.logo_asset_url;
                            const isConnected = storeInfo?.status == 1; 

                            return (
                                <Flex key={id} style={{ marginTop: "10px" }} align="center">
                                    <Image 
                                        height={24} 
                                        width={24} 
                                        src={storeLogo} 
                                        preview={false}
                                    />
                                    <Text style={{ marginLeft: "8px", marginRight: "8px" }}>
                                        {storeName}
                                    </Text>
                                    
                                    {isConnected ? (
                                        <Tooltip title={"Đã kết nối"}>
                                            <CheckCircleFilled style={{ color: "#52c41a" }} />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title={"Mất kết nối"}>
                                            <WarningFilled style={{ color: "red" }} />
                                        </Tooltip>
                                    )}
                                </Flex>
                            );
                        })}
                    </Flex>
                );

                return (
                    <Popover 
                        placement="top" 
                        content={contentStores} 
                        title="Gian hàng áp dụng"
                    >
                        <Text style={{ color: "#ff5629", cursor: "pointer" }}>
                            {storeIds.length} gian hàng
                        </Text>
                    </Popover>
                );
            },
        },
        {
            title: "Ngày bắt đầu",
            dataIndex: "begin_at",
            with: 150,
            align: "center",
            render: (value) => dayjs(value).format("DD/MM/YYYY"),
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "end_at",
            with: 150,
            align: "center",
            render: (value) => dayjs(value).format("DD/MM/YYYY"),
        },
        {
            title: "Trạng thái hợp đồng",
            with: 100,
            align: "center",
            render: (_, record) => getContractStatusLabel(record?.status),
        },

        {
            title: "Thao tác",
            dataIndex: "action",
            key: "action",
            with: 150,
            align: "center",
            render: (_item, record) => {
                const status = record?.status;

                const getItemsByStatus = (status: number) => {
                    if (status === 1) {
                        return [
                            { label: "Cấu hình CMS", key: "config_cms" },
                            { label: "Sửa hợp đồng", key: "update" },
                            { label: "Xoá hợp đồng", key: "delete" },
                            { label: "Lịch sử", key: "history" },
                        ];
                    }

                    if (status === 2) {
                        return [
                            { label: "Cấu hình CMS", key: "config_cms" },
                            { label: "Xem chi tiết", key: "update" },
                            { label: "Dừng hợp đồng", key: "stop" },
                            { label: "Lịch sử", key: "history" },
                        ];
                    }

                    if (status === 3) {
                        return [
                            { label: "Cấu hình CMS", key: "config_cms" },
                            { label: "Xem chi tiết", key: "update" },
                            { label: "Lịch sử", key: "history" },
                        ];
                    }

                    return [];
                };

                const items = getItemsByStatus(status);

                const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
                    switch (key) {
                        case "config_cms":
                            navigate(`/settings/smes/contract-management/${record?.id}/cms?sme_id=${id}`, {
                                state: {
                                    sme_id: id,
                                    storeIds: record?.store_ids,
                                    begin_at: record?.begin_at,
                                    end_at: record?.end_at,
                                    title: record?.title,
                                }
                            })
                            break;

                        case "update":
                            setShowDetailContract({
                                show: true,
                                contract: record,
                                isEditable: ![2, 3].includes(record?.status)
                            });
                            break;

                        case "delete":
                            setShowDeleteModal({
                                show: true,
                                contract: record,
                            });
                            break;

                        case "stop":
                            setShowStopModal({
                                show: true,
                                contract: record,
                            });
                            break;

                        case "history":
                            navigate(`/settings/smes/contract-management/history-contract/${record?.id}?sme_id=${id}`, {
                                state: {
                                    optionsStore: optionsStore,
                                    contract: record
                                }
                            });
                            break;
                    }
                };

                return (
                    <Dropdown menu={{ items, onClick: handleMenuClick }}>
                        <Button className="btn-base color-base">
                            <Flex align="center" gap={4} justify="center">
                                <Text className="color-base">Chọn</Text>
                                <DownOutlined style={{ fontSize: 10 }} />
                            </Flex>
                        </Button>
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <Spin spinning={false}>
            {showDetailContract?.show && <ModalDetailContract 
                show={showDetailContract?.show}
                onHide={() => setShowDetailContract({
                    show: false,
                    contract: null
                })}
                detailContract={showDetailContract?.contract}
                optionsStore={optionsStore}
                isEditable={showDetailContract?.isEditable}
            />}

            {showDeleteModal?.show && <ModalDeleteContract
                show={showDeleteModal?.show}
                onHide={() => setShowDeleteModal({
                    show: false,
                    contract: null
                })}
                contractId={showDeleteModal?.contract?.id}
                smeId={id}
            />}

            {showStopModal?.show && <ModalStopContract
                show={showStopModal?.show}
                onHide={() => setShowStopModal({
                    show: false,
                    contract: null
                })}
                contractId={showStopModal?.contract?.id}
                smeId={id}
            />}

            <Table
                className="setting-table ant-upbase"
                dataSource={dataTable  || []}
                columns={columns as any}
                bordered
                tableLayout="auto"
                // sticky={{ offsetHeader: 0 }}
                // scroll={{ x: "max-content" }}
                pagination={false}
            />
            <Pagination
                page={page}
                limit={limit}
                totalPage={totalPage}
                totalRecord={totalRecord}
                count={dataTable?.length}
                basePath={`/settings/smes/contract-management/${id}`}
                emptyTitle={"Không có dữ liệu"}
                options={[
                    { label: 25, value: 25 },
                    { label: 50, value: 50 },
                    { label: 100, value: 100 },
                ]}
            />
        </Spin>
    );
};

export default ContractManagementTable;
