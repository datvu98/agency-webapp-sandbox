import { DatePicker, Flex, Input } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";

const { Search } = Input;
const { RangePicker } = DatePicker;

type CampaignRegisterShowcaseFilterProps = {
  keyword: string;
  from?: string | null;
  to?: string | null;
  onKeywordChange: (value?: string) => void;
  onRangeChange: (value: [Dayjs | null, Dayjs | null] | null) => void;
};

const CampaignRegisterShowcaseFilter = ({
  keyword,
  from,
  to,
  onKeywordChange,
  onRangeChange,
}: CampaignRegisterShowcaseFilterProps) => {
  const rangeValue = from && to ? [dayjs(from), dayjs(to)] : null;
  const [keywordInput, setKeywordInput] = useState(keyword);

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  return (
    <Flex align="center" gap={10} style={{ width: "100%" }}>
      <Search
        placeholder="Tìm theo tên hoặc username của nhà sáng tạo"
        allowClear
        value={keywordInput}
        onSearch={(value) => onKeywordChange(value)}
        onChange={(e) => {
          const value = e.target.value;
          setKeywordInput(value);
          if (!value) onKeywordChange(undefined);
        }}
        style={{ width: 350 }}
      />

      <RangePicker
        placeholder={["DD/MM/YYYY", "DD/MM/YYYY"]}
        allowClear
        value={rangeValue as [Dayjs, Dayjs] | null}
        onChange={onRangeChange}
        style={{ width: 350 }}
        disabledDate={(current) => current && current > dayjs()}
      />
    </Flex>
  );
};

export default CampaignRegisterShowcaseFilter;
