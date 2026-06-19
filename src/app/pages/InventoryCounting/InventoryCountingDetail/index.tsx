import { useQuery } from "@apollo/client";
import { Spin } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import queryString from "querystring";
import React, { useLayoutEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import query_inventoryCountingDetail from "graphql/queries/query_inventoryCountingDetail";
import { DEFAULT_LIMIT } from "../InventoryCountingList/constants";
import EditMode from "./components/EditMode";
import ViewMode from "./components/ViewMode";

const InventoryCountingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const recordId = Number(id);
  const location = useLocation();
  const { appendBreadcrumb } = useLayoutContext();
  const params = queryString.parse(location?.search?.slice(1, 100000) ?? "") as any;

  const page = useMemo(() => {
    const p = Number(params?.page);
    return !Number.isNaN(p) ? Math.max(1, p) : 1;
  }, [params?.page]);

  const limit = useMemo(() => {
    const v = Number(params?.limit);
    return !Number.isNaN(v) ? Math.max(DEFAULT_LIMIT, v) : DEFAULT_LIMIT;
  }, [params?.limit]);

  const { data, loading, refetch } = useQuery(query_inventoryCountingDetail, {
    variables: { input: {recordId, page, limit} },
    fetchPolicy: "network-only",
    skip: !recordId,
  });

  const record = data?.inventoryCountingDetail?.data;

  useLayoutEffect(() => {
    appendBreadcrumb([
      { title: "Kiểm kê", path: "/inventory-counting" },
      { title: record?.code ?? "Chi tiết" },
    ]);
  }, [record?.code]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  // if (!record) return null;

  if (record?.status === "new") {
    return <EditMode record={record} recordId={recordId} onRefetch={refetch} />;
  }

  return (
    <ViewMode
      record={record}
      recordId={recordId}
      page={page}
      limit={limit}
      onRefetch={refetch}
    />
  );
};

export default InventoryCountingDetail;
