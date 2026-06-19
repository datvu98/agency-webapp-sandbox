import { Flex, Table } from "antd";
import React, { useCallback, useMemo, useState } from "react";
import Pagination from "app/components/Pagination";
import KOCListVideo from "app/pages/Campaigns/components/KOCListVideo";
import { TAB_KEYS } from "../constants/constant";
import {
  IFlattenedRow,
  buildTableData,
  getScrollX,
  getTableColumns,
} from "./CampaignRegisterTable.helpers";
import { type CampaignRegisterTableSharedProps } from "app/pages/Campaigns/CampaignRegister/types";

type CampaignRegisterShowcaseTableProps = Pick<
  CampaignRegisterTableSharedProps,
  "data" | "basePath" | "loading" | "total" | "page" | "limit"
> & {
  productImageByScProductId?: ReadonlyMap<number, string | null>;
};

const CampaignRegisterShowcaseTable = ({
  data,
  basePath,
  loading,
  total = 0,
  page = 1,
  limit = 10,
  productImageByScProductId,
}: CampaignRegisterShowcaseTableProps) => {
  const [expandedProductKeys, setExpandedProductKeys] = useState<
    Set<React.Key>
  >(new Set());
  const [kocVideoRecord, setKocVideoRecord] = useState<IFlattenedRow | null>(
    null,
  );

  const handleUsernameClick = useCallback((row: IFlattenedRow) => {
    setKocVideoRecord(row);
  }, []);

  const tableData = useMemo(() => buildTableData(data), [data]);
  const tableRows = useMemo<IFlattenedRow[]>(() => tableData, [tableData]);

  const handleToggleProducts = (rowKey: React.Key) => {
    setExpandedProductKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };

  const columns = useMemo(() => {
    const rawColumns = getTableColumns(TAB_KEYS.ADD_SHOWCASE, {
      expandedProductKeys,
      onToggleProducts: handleToggleProducts,
      onUsernameClick: handleUsernameClick,
      productImageByScProductId,
    });
    return rawColumns.map((col: any) => {
      const prevOnCell = col.onCell;
      return {
        ...col,
        onCell: (record: IFlattenedRow, rowIndex?: number) => {
          const prevCell = prevOnCell ? prevOnCell(record, rowIndex) : {};
          return {
            ...prevCell,
            style: {
              ...(prevCell?.style || {}),
              verticalAlign: "top",
            },
          };
        },
      };
    });
  }, [expandedProductKeys, handleUsernameClick, productImageByScProductId]);

  const totalPage = Math.ceil(total / limit);

  return (
    <Flex vertical gap={10}>
      <KOCListVideo
        open={kocVideoRecord != null}
        onCancel={() => setKocVideoRecord(null)}
        creatorId={kocVideoRecord?.creatorId}
      />
      <Table<IFlattenedRow>
        className="campaign-register-table"
        rowKey="key"
        dataSource={tableRows}
        columns={columns}
        loading={loading}
        scroll={{ x: getScrollX(TAB_KEYS.ADD_SHOWCASE) }}
        pagination={false}
      />
      <Pagination
        page={page}
        totalPage={totalPage}
        loading={loading}
        limit={limit}
        totalRecord={total}
        count={tableRows.length}
        basePath={basePath}
      />
    </Flex>
  );
};

export type { CampaignRegisterShowcaseTableProps };
export default CampaignRegisterShowcaseTable;
