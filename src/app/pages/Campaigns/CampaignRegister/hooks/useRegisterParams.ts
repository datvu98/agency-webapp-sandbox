import { useCallback, useMemo } from "react";
import { Dayjs } from "dayjs";
import { useParams, useSearchParams } from "react-router-dom";
import { DEFAULT_TAB, TabKey } from "../constants/constant";

type RegisterFilterPayload = {
  campaignStoreId?: number;
  limit: number;
  listStatus?: string[];
  page: number;
  q?: string;
  rangeTime?: string[];
  requestType: string;
};

const tabToRequestType = (tab: TabKey) => tab.replace(/-/g, "_");

export default function useRegisterParams() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const campaignStoreId = id ? Number(id) : undefined;

  const activeTab = (searchParams.get("tab") as TabKey) || DEFAULT_TAB;
  const q = searchParams.get("q") || "";
  const listStatus = searchParams.getAll("listStatus");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const setActiveTab = useCallback(
    (tab: TabKey) => {
      const next = new URLSearchParams();
      const campaignName = searchParams.get("campaignName");
      const smeId = searchParams.get("smeId");
      if (campaignName) {
        next.set("campaignName", campaignName);
      }
      if (smeId) {
        next.set("smeId", smeId);
      }
      next.set("tab", tab);
      next.set("requestType", tabToRequestType(tab));
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const setKeyword = useCallback(
    (value?: string) => {
      const next = new URLSearchParams(searchParams);
      if (value?.trim()) {
        next.set("q", value.trim());
      } else {
        next.delete("q");
      }
      next.set("page", "1");
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const setStatuses = useCallback(
    (statuses?: string[]) => {
      const next = new URLSearchParams(searchParams);
      next.delete("listStatus");
      if (statuses?.length) {
        statuses.forEach((status) => next.append("listStatus", status));
      }
      next.set("page", "1");
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const setRangeTime = useCallback(
    (range?: [Dayjs | null, Dayjs | null] | null) => {
      const next = new URLSearchParams(searchParams);
      next.delete("from");
      next.delete("to");
      if (range?.[0] && range?.[1]) {
        next.set("from", range[0].startOf("day").format("YYYY-MM-DD HH:mm:ss"));
        next.set("to", range[1].endOf("day").format("YYYY-MM-DD HH:mm:ss"));
      }
      next.set("page", "1");
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const setPagination = useCallback(
    (nextPage: number, nextLimit: number) => {
      const next = new URLSearchParams(searchParams);
      next.set("page", String(nextPage));
      next.set("limit", String(nextLimit));
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const payloadFilter: RegisterFilterPayload = useMemo(
    () => ({
      campaignStoreId,
      limit,
      page,
      requestType: tabToRequestType(activeTab),
      ...(q ? { q } : {}),
      ...(listStatus.length ? { listStatus: listStatus } : {}),
      ...(from && to ? { rangeTime: [from, to] } : {}),
    }),
    [activeTab, campaignStoreId, from, limit, listStatus, page, q, to]
  );

  const basePath = `/campaign-manage/store/${id}/register-campaign`;

  return {
    id,
    activeTab,
    setActiveTab,
    basePath,
    q,
    listStatus,
    from,
    to,
    page,
    limit,
    payloadFilter,
    setKeyword,
    setStatuses,
    setRangeTime,
    setPagination,
  };
}
