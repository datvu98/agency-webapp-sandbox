import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'querystring';
import useCampaignStoreChannelOptions from './useCampaignStoreChannelOptions';

export default function useCampaignFilters({ baseRoute = '/campaign-manage' }: { baseRoute?: string }) {
  const { optionsChannel, optionsStore, loadingStores } = useCampaignStoreChannelOptions();
  const navigate = useNavigate(); 
  const location = useLocation();
  const params = useMemo(() => queryString.parse(location.search.replace(/^\?/, '')) as any, [location.search]);

  const valuesChannel = useMemo(() => (params?.listChannelCode ? String(params.listChannelCode).split(',') : []), [params]);
  const valuesStore = useMemo(
    () => (params?.shopIds ? String(params.shopIds).split(',').map((v: string) => +v) : []),
    [params]
  );
  const valuesStatus = useMemo(() => (params?.listStatus ? String(params.listStatus).split(',') : []), [params]);
  const keyword = useMemo(() => (params?.keyword ? String(params.keyword).trim() : undefined), [params]);
  const page = useMemo(() => (params?.page ? Math.max(1, +params.page) : 1), [params]);
  const limit = useMemo(() => (params?.limit ? Math.max(1, +params.limit) : 10), [params]);
  const isVisibleToCreator = useMemo(() => {
    if (params?.isVisibleToCreator == null || params?.isVisibleToCreator === '') return undefined;
    return params?.isVisibleToCreator === 'true' || params?.isVisibleToCreator === true;
  }, [params]);

  const valueVisibleToCreators = useMemo(() => {
    const raw = params?.visibleToCreators;
    if (raw == null || raw === '') return undefined;
    const n = Number(raw);
    return n === 0 || n === 1 ? n : undefined;
  }, [params]);
  const valueHasDemoApprovals = useMemo(() => {
    const raw = params?.hasDemoApprovals;
    if (raw == null || raw === '') return undefined;
    const n = Number(String(raw).split(',')[0]);
    return n === 0 || n === 1 ? n : undefined;
  }, [params]);

  const mappedOptionsStore = useMemo(() => {
    if (!valuesChannel || valuesChannel.length == 0) return optionsStore ?? [];
    return (optionsStore ?? []).filter((store: any) => valuesChannel.includes(store?.channel?.code));
  }, [optionsStore, valuesChannel]);

  const onChangeChannel = useCallback(
    (values: any[]) => {
      const requestUrl: any = {
        ...params,
        listChannelCode: values?.length ? values.toString() : undefined,
        shopIds: undefined,
      };
      const q = queryString.stringify(requestUrl).replaceAll('%2C', ',');
      navigate(`${baseRoute}?${q}`);
    },
    [params, navigate, baseRoute]
  );

  const onChangeStore = useCallback(
    (values: any[]) => {
      const requestUrl: any = {
        ...params,
        shopIds: values?.length ? values.toString() : undefined,
      };
      const q = queryString.stringify(requestUrl).replaceAll('%2C', ',');
      navigate(`${baseRoute}?${q}`);
    },
    [params, navigate, baseRoute]
  );
  const onChangeStatus = useCallback(
    (values: any[]) => {
      const requestUrl: any = {
        ...params,
        listStatus: values?.length ? values.toString() : undefined,
        page: 1,
      };
      const q = queryString.stringify(requestUrl).replaceAll('%2C', ',');
      navigate(`${baseRoute}?${q}`);
    },
    [params, navigate, baseRoute]
  );
  const onChangeKeyword = useCallback(
    (value: string) => {
      const requestUrl: any = {
        ...params,
        keyword: value?.trim() || undefined,
        page: 1,
      };
      const q = queryString.stringify(requestUrl).replaceAll('%2C', ',');
      navigate(`${baseRoute}?${q}`);
    },
    [params, navigate, baseRoute]
  );

  const onChangeVisibleToCreators = useCallback(
    (value: number | null | undefined) => {
      const requestUrl: any = {
        ...params,
        visibleToCreators:
          value === 0 || value === 1 ? String(value) : undefined,
        page: 1,
      };
      const q = queryString.stringify(requestUrl).replaceAll('%2C', ',');
      navigate(`${baseRoute}?${q}`);
    },
    [params, navigate, baseRoute]
  );
  const onChangeHasDemoApprovals = useCallback(
    (value: number | null | undefined) => {
      const requestUrl: any = {
        ...params,
        hasDemoApprovals:
          value === 0 || value === 1 ? String(value) : undefined,
        page: 1,
      };
      const q = queryString.stringify(requestUrl).replaceAll('%2C', ',');
      navigate(`${baseRoute}?${q}`);
    },
    [params, navigate, baseRoute]
  );
  const onChangePage = useCallback(
    (value: number) => {
      const requestUrl: any = {
        ...params,
        page: value,
      };
      const q = queryString.stringify(requestUrl).replaceAll('%2C', ',');
      navigate(`${baseRoute}?${q}`);
    }, [params, navigate, baseRoute]
  );
  const onChangeLimit = useCallback(
    (value: number) => {
      const requestUrl: any = {
        ...params,
        limit: value,
        page: 1,
      };
      const q = queryString.stringify(requestUrl).replaceAll('%2C', ',');
      navigate(`${baseRoute}?${q}`);
    },
    [params, navigate, baseRoute]
  );

  const payloadFilter = useMemo(() => {
    const filter: any = { page, limit };
    if (keyword) filter.keyword = keyword;
    if (valuesStatus?.length) filter.listStatus = valuesStatus;
    if (valuesChannel?.length) filter.listChannelCode = valuesChannel;
    if (valuesStore?.length) filter.shopIds = valuesStore;
    if (valueVisibleToCreators === 0 || valueVisibleToCreators === 1) {
      filter.visibleToCreators = [valueVisibleToCreators];
    }
    if (valueHasDemoApprovals === 0 || valueHasDemoApprovals === 1) {
      filter.hasDemoApprovals = [valueHasDemoApprovals];
    }
    return filter;
  }, [valuesStatus, valuesChannel, valuesStore, keyword, page, limit, valueVisibleToCreators, valueHasDemoApprovals]);

  return {
    params,
    valuesKeyword: keyword ?? '',
    valuesChannel,
    valuesStore,
    valuesStatus,
    valueVisibleToCreators,
    valueHasDemoApprovals,
    isVisibleToCreator,
    page,
    limit,
    optionsChannel: optionsChannel ?? [],
    optionsStore: optionsStore ?? [],
    mappedOptionsStore,
    onChangeKeyword,
    onChangeChannel,
    onChangeStore,
    onChangeStatus,
    onChangeVisibleToCreators,
    onChangeHasDemoApprovals,
    onChangePage,
    onChangeLimit,
    loadingStores,
    payloadFilter,
  };
}