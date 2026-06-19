import { DatePicker, Flex, Input, Select, Space } from 'antd'
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import { REGISTER_SAMPLE_STATUS_OPTIONS, TAB_KEYS, TabKey } from '../constants/constant';

const { Search } = Input;
const { RangePicker } = DatePicker;

type CampaignRegisterFilterProps = {
    tab: TabKey;
    keyword: string;
    listStatus: string[];
    from?: string | null;
    to?: string | null;
    onKeywordChange: (value?: string) => void;
    onStatusChange: (value?: string[]) => void;
    onRangeChange: (value: [Dayjs | null, Dayjs | null] | null) => void;
};

const CampaignRegisterFilter = ({
    tab,
    keyword,
    listStatus,
    from,
    to,
    onKeywordChange,
    onStatusChange,
    onRangeChange,
}: CampaignRegisterFilterProps) => {
    const rangeValue = from && to ? [dayjs(from), dayjs(to)] : null;
    const [keywordInput, setKeywordInput] = useState(keyword);

    useEffect(() => {
        setKeywordInput(keyword);
    }, [keyword]);

    return (
        <Flex align='center' gap={10} style={{ width: '100%' }}>
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
            <Space.Compact block style={{ width: 460 }}>
                <Select
                    defaultValue="createdAt"
                    options={[{ label: 'Ngày tạo', value: 'createdAt' }]}
                    style={{ width: 200 }}
                />
                <RangePicker
                    placeholder={['DD/MM/YYYY', 'DD/MM/YYYY']}
                    allowClear
                    value={rangeValue as [Dayjs, Dayjs] | null}
                    onChange={onRangeChange}
                    style={{ width: 350 }}
                    disabledDate={(current) => current && current > dayjs()}
                />
            </Space.Compact>
            {tab === TAB_KEYS.REGISTER_SAMPLE && <Select
                placeholder='Chọn trạng thái duyệt mẫu'
                allowClear
                mode="multiple"
                style={{ width: 350 }}
                value={listStatus}
                options={REGISTER_SAMPLE_STATUS_OPTIONS}
                onChange={onStatusChange}
            />}
        </Flex>
    )
}

export default CampaignRegisterFilter