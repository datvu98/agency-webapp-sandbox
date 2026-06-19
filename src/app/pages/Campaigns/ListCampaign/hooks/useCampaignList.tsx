import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import mutate_affLoadCampaigns from 'graphql/mutations/mutate_affLoadCampaigns';
import mutate_affLoadCampaign from 'graphql/mutations/mutate_affLoadCampaign';
import query_affFindTrackingLoadCampaign from 'graphql/queries/query_affFindTrackingLoadCampaign';
import { showAlert } from 'utils/helper';
import query_scPartnerAccounts from 'graphql/queries/query_scPartnerAccounts';
import query_affGetTrackingLoadCampaign from 'graphql/queries/query_affGetTrackingLoadCampaign';
import query_affGetCampaigns from 'graphql/queries/query_affGetCampaigns';
import useCampaignFilters from './useCampaignFilters';
import useCampaignStoreChannelOptions from './useCampaignStoreChannelOptions';
import mutate_affUpdateCampaignStoreVisible from 'graphql/mutations/mutate_affUpdateCampaignStoreVisible';
import query_affCountCampaignEligible from 'graphql/queries/query_affCountCampaignEligible';
const POLL_INTERVAL_MS = 2000;
const BY_ID_CONCURRENCY = 3;

const useCampaignList = () => {
    const [trackingInput, setTrackingInput] = useState<any>(null);
    const [trackingData, setTrackingData] = useState<any>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [totalEligibleCount, setTotalEligibleCount] = useState<number>(0);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isTrackingByIds, setIsTrackingByIds] = useState(false);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // ==== Query stores & channels ====
    const { dataStores, loadingStores, optionsChannel, optionsStore } = useCampaignStoreChannelOptions();

    // Hàm lấy thông tin store theo ID
    const getStoreById = (id: number) => {
        const store = dataStores?.scAgencySaleStores?.data?.find((store: any) => store?.id == id);
        const channel = dataStores?.op_connector_channels?.find(
            (channel: any) => channel?.code == store?.connector_channel_code
        );

        return {
            store,
            channel,
        };
    };

    // Hàm lấy thông tin channel theo connector_channel_code
    const getChannelByCode = (code: string) => {
        return dataStores?.op_connector_channels?.find(
            (channel: any) => channel?.code == code
        );
    };

    // Mutations
    const [loadCampaigns, { loading: loadingLoadCampaigns }] = useMutation(mutate_affLoadCampaigns);
    const [loadCampaignById] = useMutation(mutate_affLoadCampaign);

    // Lazy queries
    const [findTrackingLoadCampaign] = useLazyQuery(
        query_affFindTrackingLoadCampaign,
        { fetchPolicy: 'network-only' }
    );

    const [getTrackingLoadCampaign, { loading: loadingGetTracking }] = useLazyQuery(
        query_affGetTrackingLoadCampaign,
        { fetchPolicy: 'network-only' }
    );

    const { data: dataPartnerAccounts } = useQuery(query_scPartnerAccounts);
    const dataPartnerAccount = useMemo(() => {
        return dataPartnerAccounts?.scPartnerAccounts ?? [];
    }, [dataPartnerAccounts]);

    // Dừng poll
    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    // Poll affFindTrackingLoadCampaign khi có trackingInput
    useEffect(() => {
        if (!trackingInput || isCompleted) return;

        const poll = async () => {
            try {
                const { data, error } = await findTrackingLoadCampaign({ variables: { filter: trackingInput } });
                if (error) {
                    stopPolling();
                    setTrackingInput(null);
                    setTrackingData(null);
                    showAlert.error(error?.message || 'Lỗi khi theo dõi tiến trình tải');
                    return;
                }
                const result = data?.affFindTrackingLoadCampaign;
                if (!result?.success) {
                    stopPolling();
                    setTrackingInput(null);
                    setTrackingData(null);
                    showAlert.error(result?.message || 'Lỗi khi theo dõi tiến trình tải');
                    return;
                }
                if (result?.data) {
                    setTrackingData(result.data);
                    const affData = result.data;
                    const total = affData.total ?? 0;
                    const totalDone = (affData.totalSuccess ?? 0) + (affData.totalFail ?? 0);
                    if (total > 0 && totalDone >= total) {
                        stopPolling();
                        setIsCompleted(true);
                        
                        // Gọi API đếm chiến dịch đủ điều kiện khi hoàn thành
                        const partnerAccountId = affData.partnerAccountId;
                        if (partnerAccountId) {
                            handleCountCampaignEligible(partnerAccountId);
                        }
                        
                        showAlert.success('Tải chiến dịch thành công');
                    }
                }
            } catch (error) {
                console.log(error);
                stopPolling();
                setTrackingInput(null);
                setTrackingData(null);
                showAlert.error('Có lỗi xảy ra khi theo dõi tiến trình tải');
            }
        };

        poll(); // Gọi ngay lần đầu
        pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

        return () => stopPolling();
    }, [trackingInput, isCompleted, findTrackingLoadCampaign, stopPolling]);

    // Hàm tải chiến dịch - luồng mới (gọi lần lượt, lỗi ở bước nào thì dừng hẳn)
    const handleLoadCampaigns = useCallback(
        async (connectorChannelCode: string, partnerAccountId: number) => {
            setIsLoadingInitial(true);
            try {
                // Bước 1: Gọi affGetTrackingLoadCampaign trước để lấy danh sách tài khoản đang tải
                const { data: dataGetTracking, error: errorGetTracking } = await getTrackingLoadCampaign({
                    variables: { filter: { partnerAccountId } },
                });
                if (errorGetTracking) {
                    showAlert.error(errorGetTracking.message || 'Lỗi khi lấy trạng thái tải chiến dịch');
                    setIsLoadingInitial(false);
                    return;
                }
                const getTrackingResult = dataGetTracking?.affGetTrackingLoadCampaign;
                if (!getTrackingResult?.success) {
                    showAlert.error(getTrackingResult?.message || 'Lỗi khi lấy trạng thái tải chiến dịch');
                    setIsLoadingInitial(false);
                    return;
                }
                const affTrackingList = getTrackingResult?.data?.affTrackingLoadCampaign;
                const list = Array.isArray(affTrackingList)
                    ? affTrackingList
                    : affTrackingList
                        ? [affTrackingList]
                        : [];

                // Bước 2: Kiểm tra partnerAccountId có trong danh sách không
                const existingItem = list.find((item: any) => item?.partnerAccountId == partnerAccountId);

                if (existingItem) {
                    // Đã có trong quá trình tải -> gọi affFindTrackingLoadCampaign với id để theo dõi tiếp
                    setTrackingInput({ trackingId: existingItem.id });
                    setTrackingData(existingItem);
                    setIsLoadingInitial(false);
                } else {
                    // Chưa có -> gọi affLoadCampaigns (Bước 3)
                    const { data, errors } = await loadCampaigns({
                        variables: { connectorChannelCode, partnerAccountId },
                    });
                    if (errors?.length) {
                        showAlert.error(errors[0]?.message || 'Lỗi khi tải chiến dịch');
                        setIsLoadingInitial(false);
                        return;
                    }
                    const result = data?.affLoadCampaigns;
                    if (!result?.success) {
                        showAlert.error(result?.message || 'Tải chiến dịch thất bại');
                        setIsLoadingInitial(false);
                        return;
                    }
                    if (result?.data == null) {
                        showAlert.error(result?.message || 'Tải chiến dịch thất bại');
                        setIsLoadingInitial(false);
                        return;
                    }
                    const trackingId =
                        typeof result.data === 'object'
                            ? result.data.tracking_id
                            : null;

                    if (trackingId) {
                        setTrackingInput({ trackingId });
                    }
                    setIsLoadingInitial(false);
                }
            } catch (error) {
                console.log(error);
                showAlert.error('Có lỗi xảy ra khi tải chiến dịch');
                setIsLoadingInitial(false);
            }
        },
        [loadCampaigns, getTrackingLoadCampaign]
    );

    const [countCampaignEligible, { loading: loadingCountCampaignEligible }] = useLazyQuery(query_affCountCampaignEligible, {
        fetchPolicy: 'network-only'
    });

    const handleCountCampaignEligible = useCallback(async (partnerAccountId: number) => {
        try {
            const { data, error } = await countCampaignEligible({ variables: { partnerAccountId } });
            if (error) {
                console.error('Error counting eligible campaigns:', error);
                setTotalEligibleCount(0);
                return;
            }
            const result = data?.affCountCampaignEligible;
            if (!result?.success) {
                console.error('Failed to count eligible campaigns:', result?.message);
                setTotalEligibleCount(0);
                return;
            }
            const count = result?.data?.total ?? 0;
            setTotalEligibleCount(count);
        } catch (error) {
            console.error('Exception counting eligible campaigns:', error);
            setTotalEligibleCount(0);
        }
    }, [countCampaignEligible]);

    // Tải chiến dịch theo danh sách ID - Worker Pool với concurrency giới hạn
    const handleLoadCampaignsByIds = useCallback(
        async (refCampaignIds: string[], partnerAccountId: number, channelCode: string) => {
            const total = refCampaignIds.length;
            if (total === 0) return;

            let totalSuccess = 0;
            let totalFail = 0;
            const listErrorMessage: Array<{ ref_id: string; campaign_name: string; message: string }> = [];

            setIsTrackingByIds(true);
            setIsCompleted(false);
            setTrackingData({ total, totalSuccess: 0, totalFail: 0, listErrorMessage: [] });

            // Worker pool: mỗi worker lấy ID tiếp theo cho đến khi hết
            let index = 0;
            const runWorker = async (): Promise<void> => {
                while (index < total) {
                    const currentIndex = index++;
                    const refCampaignId = refCampaignIds[currentIndex];
                    try {
                        const { data } = await loadCampaignById({
                            variables: { partnerAccountId, channelCode, refCampaignId },
                        });
                        const result = data?.affLoadCampaign;
                        if (result?.success) {
                            totalSuccess++;
                        } else {
                            totalFail++;
                            listErrorMessage.push({
                                ref_id: refCampaignId,
                                campaign_name: refCampaignId,
                                message: result?.message || 'Thất bại',
                            });
                        }
                    } catch (err: any) {
                        totalFail++;
                        listErrorMessage.push({
                            ref_id: refCampaignId,
                            campaign_name: refCampaignId,
                            message: err?.message || 'Có lỗi xảy ra',
                        });
                    }
                    setTrackingData({
                        total,
                        totalSuccess,
                        totalFail,
                        listErrorMessage: [...listErrorMessage],
                    });
                }
            };

            // Khởi chạy BY_ID_CONCURRENCY workers song song
            const workers = Array.from(
                { length: Math.min(BY_ID_CONCURRENCY, total) },
                () => runWorker()
            );
            await Promise.all(workers);

            setIsTrackingByIds(false);
            setIsCompleted(true);
            // showAlert.success(`Tải xong ${totalSuccess}/${total} chiến dịch`);
        },
        [loadCampaignById]
    );

    // Reset tracking khi modal đóng
    const clearTracking = useCallback(() => {
        stopPolling();
        setTrackingInput(null);
        setTrackingData(null);
        setIsCompleted(false);
        setTotalEligibleCount(0);
        setIsLoadingInitial(false);
        setIsTrackingByIds(false);
    }, [stopPolling]);

    const { payloadFilter } = useCampaignFilters({ baseRoute: '/campaign-manage/list-campaign' });

    const { data: dataGetCampaigns, loading: loadingGetCampaigns, refetch: refetchCampaigns } = useQuery(query_affGetCampaigns, {
        variables: { filter: payloadFilter },
        fetchPolicy: 'network-only',
    });

    const listRefCampaignIds = useMemo(() => {
        return dataGetCampaigns?.affGetCampaigns?.data?.items?.map((item: any) => item?.refCampaignId) ?? [];
    }, [dataGetCampaigns]);

    const dataGetCampaign = useMemo(() => {
        return dataGetCampaigns?.affGetCampaigns?.data?.items ?? []
    }, [dataGetCampaigns]);

    const paginationData = useMemo(() => {
        const data = dataGetCampaigns?.affGetCampaigns?.data;
        const total = data?.total ?? 0;
        const limit = payloadFilter.limit ?? 10;
        const page = payloadFilter.page ?? 1;
        const totalPage = Math.ceil(total / limit);
        const count = dataGetCampaign.length;

        return {
            page,
            limit,
            total,
            totalPage,
            count,
        };
    }, [dataGetCampaigns, payloadFilter, dataGetCampaign]);

    const [updateCampaignStoreVisible, { loading: loadingUpdateCampaignStoreVisible }] = useMutation(mutate_affUpdateCampaignStoreVisible);
    const handleUpdateCampaignStoreVisible = useCallback(async (input: {
        campaignStoreId: number;
        visibleToCreator: number;
    }) => {
        const { data } = await updateCampaignStoreVisible({
            variables: {
                input: {
                    campaignStoreId: input.campaignStoreId,
                    visibleToCreator: input.visibleToCreator,
                }
            }
        });
        if (!data?.affUpdateCampaignStoreVisible?.success) {
            showAlert.error(data?.affUpdateCampaignStoreVisible?.message || 'Cập nhật hiển thị chiến dịch thất bại');
            return
        } else {
            showAlert.success('Cập nhật hiển thị chiến dịch thành công');
            refetchCampaigns();
        }
    }, [updateCampaignStoreVisible]);

    return {
        dataGetCampaign,
        loadingGetCampaigns,
        paginationData,
        refetchCampaigns,
        getStoreById,
        getChannelByCode,
        handleLoadCampaigns,
        handleLoadCampaignsByIds,
        loadingLoadCampaigns: loadingLoadCampaigns || loadingGetTracking || loadingUpdateCampaignStoreVisible,
        trackingData,
        clearTracking,
        isTracking: !!trackingInput || isTrackingByIds,
        isCompleted,
        isLoadingInitial,
        // filters
        optionsChannel,
        optionsStore,
        loadingStores,
        dataPartnerAccount,
        handleUpdateCampaignStoreVisible,
        loadingUpdateCampaignStoreVisible,
        handleCountCampaignEligible,
        totalEligibleCount,
        listRefCampaignIds,
    };
};

export default useCampaignList;
