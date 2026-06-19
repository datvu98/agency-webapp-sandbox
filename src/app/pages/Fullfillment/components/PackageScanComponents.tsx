import React, { Fragment, memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Card, Input, Button, Table, TableProps, Flex, Typography, Space, InputRef, Spin } from "antd";
import { DeleteOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import { useFullfillmentContext } from "app/contexts/FullfillmentContext";
import { useScanDetection, useOnKeyPress } from "./PackageScanHooks";
import query_sfFindPackageReceive from "graphql/queries/query_sfFindPackageReceive";
import { showAlert } from "utils/helper";
import mutate_agencyCreateTempAccessToken from "graphql/mutations/mutate_agencyCreateTempAccessToken";
const { Text } = Typography;
import queryString from "querystring";
const { Search } = Input;

// ==================== CONSTANTS ====================
const WAREHOUSE_NOT_IMPORT = 1;
const WAREHOUSE_IMPORTED_NOT_FULL = 2;
const WAREHOUSE_IMPORTED_FULL = 3;
const COLOR_STATUS = ["#F3252E", "#FFA500", "#00DB6D"];

const TYPE_ORDER_SESSION_RECEIVED: { [key: number]: string } = {
    1: "Đơn hàng",
    2: "Đơn huỷ bất thường",
    3: "Đơn trả hàng"
};

// Hook: useSearchPackage
const useSearchPackage = ({
    search,
    packages,
    onComplete,
    isLoad = false,
    onReset,
}: {
    search: string;
    packages: any[];
    onComplete: (item: any) => void;
    isLoad?: boolean;
    onReset?: () => void;
}) => {
    const _refSoundSuccess = useRef<HTMLAudioElement | null>(null);
    const _refSoundError = useRef<HTMLAudioElement | null>(null);

    const [getAccessToken, { loading: loadingGetAccessToken }] = useMutation(mutate_agencyCreateTempAccessToken)

    const { loading, refetch } = useQuery(query_sfFindPackageReceive, {
        variables: {
            keyword: search
        },
        onCompleted: (data) => {
            !!onReset && onReset();
            if (!search?.trim()) {
                showAlert.error("Kiện hàng không tồn tại");
                return;
            }

            const listRecord = data?.sfFindPackageReceive?.list_record || [];
            let currentPackages = [...(packages || [])];

            const processFoundPackage = (packageRecord: any) => {
                const isExistPackage = currentPackages?.some((item: any) => {
                    if (item?.isManual) {
                        if (!!item?.data) {
                            return item?.code === search || (item?.data?.object_id === packageRecord?.object_id && item?.data?.object_type === packageRecord?.object_type);
                        }
                        return item?.code === search;
                    }
                    return item?.data?.object_id === packageRecord?.object_id && item?.data?.object_type === packageRecord?.object_type;
                });

                if (isExistPackage) {
                    if (_refSoundError.current) {
                        _refSoundError.current.play().catch(() => {});
                    }
                    showAlert.error("Kiện hàng đã được quét");
                    return;
                }

                if (!!packageRecord?.sf_received_code) {
                    if (_refSoundError.current) {
                        _refSoundError.current.play().catch(() => {});
                    }
                    showAlert.error(`Kiện hàng được thêm vào phiên nhận "${packageRecord?.sf_received_code}"`);
                    return;
                }

                if (!!packageRecord?.has_import_history) {
                    if (_refSoundError.current) {
                        _refSoundError.current.play().catch(() => {});
                    }
                    showAlert.error('Kiện hàng đã được xử lý trả hàng');
                    return;
                }

                if (_refSoundSuccess.current) {
                    _refSoundSuccess.current.play().catch(() => {});
                }
                const newItem = {
                    code: packageRecord?.keyword,
                    isManual: false,
                    data: { ...packageRecord }
                };
                onComplete(newItem);
                currentPackages.push(newItem);
            };

            const processManualPackage = (packageRecord?: any) => {
                const code = packageRecord?.keyword || search;
                const isExistPackage = currentPackages?.some((item: any) => item?.code === code);
                if (isExistPackage) {
                    if (_refSoundError.current) {
                        _refSoundError.current.play().catch(() => {});
                    }
                    showAlert.error("Kiện hàng đã được quét");
                    return;
                }

                if (!!packageRecord?.sf_received_code) {
                    if (_refSoundError.current) {
                        _refSoundError.current.play().catch(() => {});
                    }
                    showAlert.error(`Kiện hàng được thêm vào phiên nhận "${packageRecord?.sf_received_code}"`);
                    return;
                }

                if (_refSoundSuccess.current) {
                    _refSoundSuccess.current.play().catch(() => {});
                }
                const newItem = {
                    code,
                    isManual: true,
                    data: null
                };
                onComplete(newItem);
                currentPackages.push(newItem);
            };

            if (listRecord.length === 0) {
                processManualPackage();
                return;
            }

            listRecord.forEach((packageRecord: any) => {
                if (!!packageRecord?.object_id) {
                    processFoundPackage(packageRecord);
                } else {
                    processManualPackage(packageRecord);
                }
            });
        },
        skip: !isLoad,
        fetchPolicy: 'cache-and-network',
    });

    return { loading, refetch };
};

// Component: SectionScan
export const SectionScan = memo(({ onCleanScanPackages, refetchPackages, onClearInputReady }: { onCleanScanPackages: () => void; refetchPackages: () => void; onClearInputReady?: (clearFn: () => void) => void }) => {
    const { setIsLoadPackages, inputRefOrder, searchParams, setSearchParams } = useFullfillmentContext();
    const [inputValue, setInputValue] = useState('');

    const clearInput = useCallback(() => {
        setInputValue('');
        setTimeout(() => inputRefOrder?.current?.input?.focus(), 0);
    }, [inputRefOrder]);

    useLayoutEffect(() => {
        onClearInputReady?.(clearInput);
    }, [onClearInputReady, clearInput]);

    const handleClean = useCallback(() => {
        clearInput();
        onCleanScanPackages();
    }, [clearInput, onCleanScanPackages]);

    useScanDetection({
        onComplete: async (value) => {
            const inputElement = inputRefOrder?.current?.input;
            if (document?.activeElement !== inputElement) return;
            setIsLoadPackages?.(true);
            setSearchParams?.((prev: any) => ({ ...prev, search: value }));
            clearInput();
        },
        ignoreIfFocusOn: inputRefOrder?.current?.input || undefined,
        container: inputRefOrder?.current?.input || document,
    });

    useOnKeyPress(handleClean, "F3");

    return (
        <Card>
            <Text strong style={{ fontSize: 13, marginBottom: 16, display: 'block' }}>
                QUÉT MÃ VẠCH
            </Text>
            <Flex vertical gap={16} align="center">
                <Input
                    placeholder="Quét hoặc nhập mã"
                    size="large"
                    ref={inputRefOrder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    prefix={
                        <SearchOutlined
                            style={{
                                color: "#7e8299",
                                paddingLeft: 8,
                                paddingRight: 8,
                            }}
                        />
                    }
                    onPressEnter={(e: any) => {
                        const valueSearch = e.target.value;
                        setIsLoadPackages?.(true);
                        setSearchParams?.((prev: any) => ({ ...prev, search: valueSearch }));
                        if (valueSearch === searchParams?.search) {
                            refetchPackages();
                        }
                        clearInput();
                    }}
                    style={{ maxWidth: 600, width: '100%' }}
                />
                <Button
                    type="default"
                    size="large"
                    style={{ background: "#6C757D", borderColor: "#6C757D", color: "#fff", minWidth: 200, fontSize: 13, }}
                    onClick={handleClean}
                >
                    XÓA VÀ QUÉT TIẾP (F3)
                </Button>
            </Flex>
        </Card>
    );
});

// Component: TablePackages
export const TablePackages = memo(({ loading, packages, stores, onRemovePackage }: { loading: boolean; packages: any[]; stores: any[]; onRemovePackage: (pack: any) => void }) => {
    const [getAccessToken, { loading: loadingGetAccessToken }] = useMutation(mutate_agencyCreateTempAccessToken)
    
    
    const viewStatus = useCallback((importStatus: number) => {
        return (
            <span style={{
                padding: "4px 8px",
                borderRadius: "4px",
                color: "#fff",
                background: COLOR_STATUS[importStatus - 1],
                fontSize: "12px",
                lineHeight: "12px",
            }}>
                {
                    importStatus === WAREHOUSE_NOT_IMPORT ? "Không nhập kho" :
                        importStatus === WAREHOUSE_IMPORTED_NOT_FULL ? "Nhập kho một phần" :
                            importStatus === WAREHOUSE_IMPORTED_FULL ? "Nhập kho toàn bộ" : ""
                }
            </span>
        );
    }, []);

    const getDateRangeTimestamp = () => {
        const now = dayjs();
        const gt = now
          .subtract(3, "month")
          .startOf("day")
          .unix(); 
        const lt = now
          .endOf("day")
          .unix(); 
      
        return { gt, lt };
      };

      const buildRedirectPath = (record: any) => {
        const { object_type, source, object_ref_id } = record?.data || {};
        const objectType = Number(object_type);
        const baseOrders = "/orders/list";
        const listSource = source === "web" || source === "platform" ? "platform" : "manual";
      
        switch (objectType) {
          case 1: {
            const { gt, lt } = getDateRangeTimestamp();
            const params = new URLSearchParams({
              gt: String(gt),
              lt: String(lt),
              page: "1",
              list_source: listSource,
              q: object_ref_id || "",
            });
            return `${baseOrders}?${params.toString()}`;
          }
          case 2: {
            const params = new URLSearchParams({ page: "1", q: object_ref_id || "" });
            return `/orders/fail-delivery-order?${params.toString()}`;
          }
          case 3: {
            const params = new URLSearchParams({ q: object_ref_id || "", search_type: "ref_return_id" });
            return `/orders/refund-order?${params.toString()}`;
          }
          default:
            return baseOrders;
        }
      };

      const handleViewOrder = async (record: any) => {
        try {
          const smeId = Number(record?.data?.sme_id);
          const domain = process.env.REACT_APP_SME_ENDPOINT;
          if (!smeId) return;

          const { data } = await getAccessToken({
            variables: { smeId },
          });

          const result = data?.agencyCreateTempAccessToken;

          if (!result?.success) {
            showAlert.error(result?.message);
            return;
          }

          const token = result.data;

          const redirectPath = buildRedirectPath(record);
          const verifyUrl = `${domain}/verify-token?${queryString.stringify({
            token,
            redirect: redirectPath
          })}`;

          window.open(verifyUrl, "_blank");
        } catch (error) {
          console.error(error);
          showAlert.error("Có lỗi xảy ra khi mở đơn hàng");
        }
      };

    const columns: TableProps['columns'] = useMemo(() => {
        return [
            {
                title: "Mã quét/nhập",
                dataIndex: 'code',
                width: '25%',
                key: 'code',
                render: (text: string) => <Text style={{ fontSize: 15 }}>{text}</Text>
            },
            {
                title: "Loại đơn",
                dataIndex: 'object_type',
                width: '15%',
                key: 'object_type',
                render: (text: number, record: any) => {
                    if (!record?.data) {
                        return <Text type="secondary">Không tìm thấy thông tin</Text>;
                    }
                    return <Text>{TYPE_ORDER_SESSION_RECEIVED?.[record?.data?.object_type] || ''}</Text>;
                }
            },
            {
                title: "Gian hàng",
                dataIndex: 'store_id',
                width: '15%',
                key: 'store_id',
                align: 'center' as const,
                render: (text: number, record: any) => {
                    if (!record?.data) {
                        return <Text type="secondary">-</Text>;
                    }
                    const store = stores?.find((st: any) => st?.value === record?.data?.store_id);
                    if (!store) {
                        return <Text type="secondary">Gian đã ngắt kết nối</Text>;
                    }
                    return (
                        <Flex align="center" justify="center" gap={8}>
                            {!!store?.logo && (
                                <img
                                    style={{ width: 16, height: 16, borderRadius: 4 }}
                                    src={store?.logo}
                                    alt=""
                                />
                            )}
                            <Text>{store?.label}</Text>
                        </Flex>
                    );
                }
            },
            {
                title: "Thông tin kiện",
                dataIndex: 'info',
                width: '35%',
                key: 'info',
                render: (text: any, record: any) => {
                    if (!record?.data) {
                        return <Text type="secondary">-</Text>;
                    }
                    return (
                        <Flex vertical gap={4}>
                            <Text>
                                {record?.data?.object_type === 3 ? 'Mã trả hàng' : 'Mã đơn hàng'}: {record?.data?.object_ref_id}
                            </Text>
                            <Text>
                                {record?.data?.object_type === 3 ? 'Mã vận đơn trả hàng' : 'Mã vận đơn'}: {record?.data?.object_tracking_number}
                            </Text>
                            <Text>
                                Mã đơn hàng phát sinh: {record?.data?.ref_order_id}
                            </Text>
                            {record?.data?.has_import_history !== 0 && viewStatus(record?.data?.has_import_history)}
                        </Flex>
                    );
                }
            },
            {
                title: "Thao tác",
                width: '10%',
                key: 'action',
                align: 'center' as const,
                render: (_: any, record: any) => (
                    <Space>
                        {loadingGetAccessToken ? <Spin size="small"  /> : (
                                <>
                                    <EyeOutlined 
                                        style={{
                                            color: '#1890ff' ,
                                            cursor: record?.data ? 'pointer' : 'not-allowed',
                                            fontSize: 18,
                                        }}
                                        onClick={() => {
                                            if (record?.data) {
                                                handleViewOrder(record);
                                            }
                                        }}
                                    />
                                </>
                        )}

                        <DeleteOutlined
                            style={{
                                color:'#ff4d4f',
                                cursor: packages?.length > 1 ? 'pointer' : 'not-allowed',
                                fontSize: 18
                            }}
                            onClick={() => {
                                if (packages?.length > 1) {
                                    onRemovePackage(record);
                                }
                            }}
                        />
                    </Space>
                )
            },
        ];
    }, [packages, stores, viewStatus, onRemovePackage]);

    return (
        <Card>
            <Text strong style={{ fontSize: 14, marginBottom: 16, display: 'block' }}>
                Kết quả tìm kiếm
            </Text>
            <Table
                columns={columns}
                dataSource={packages?.map((item, index) => ({ ...item, key: `package-${index}` }))}
                loading={loading}
                pagination={false}
                locale={{
                    emptyText: 'Danh sách tìm kiếm rỗng, xin vui lòng nhập mã kiện hàng hoặc quét mã vạch'
                }}
            />
        </Card>
    );
});

// Main Component
const PackageScanMain = () => {
    const { isLoadPackages, setIsLoadPackages, inputRefOrder, searchParams, setSearchParams, packagesSession, setPackagesSession, optionsStore } = useFullfillmentContext();
    const clearInputRef = useRef<(() => void) | null>(null);

    useLayoutEffect(() => {
        inputRefOrder?.current?.input?.focus();
    }, []);

    const { loading: loadingPackages, refetch: refetchPackages } = useSearchPackage({
        search: searchParams?.search || '',
        packages: packagesSession || [],
        isLoad: isLoadPackages || false,
        onComplete: (item) => {
            setPackagesSession?.((prev: any[]) => prev.concat([{
                ...item,
                scan_time: dayjs().unix()
            }]));
        },
        onReset: () => {
            setIsLoadPackages?.(false);
            clearInputRef.current?.();
        }
    });

    const onCleanScanPackages = useCallback(() => {
        setPackagesSession?.([]);
        clearInputRef.current?.();
        setSearchParams?.((prev: any) => ({ ...prev, search: '' }));
    }, [setPackagesSession, setSearchParams]);

    const onRemovePackage = useCallback((pack: any) => {
        if ((packagesSession?.length || 0) === 1) return;
        setPackagesSession?.((prev: any[]) => prev.filter((pck: any) => pck?.code !== pack?.code));
    }, [packagesSession, setPackagesSession]);

    return (
        <Fragment>
            <SectionScan
                onCleanScanPackages={onCleanScanPackages}
                refetchPackages={refetchPackages}
                onClearInputReady={(clearFn) => {
                    clearInputRef.current = clearFn;
                }}
            />
            <TablePackages
                loading={loadingPackages}
                packages={packagesSession || []}
                stores={optionsStore || []}
                onRemovePackage={onRemovePackage}
            />
        </Fragment>
    );
};

export { PackageScanMain };

