import React from "react";
import useCampaignFilters from "../hooks/useCampaignFilters";
import { Flex, Typography, Select, Input, Row, Col } from "antd";
import { CAMPAIGN_STATUS_OPTIONS, REVIEW_DEMO_STATUS_OPTIONS, VISIBLE_TO_CREATORS_FILTER_OPTIONS } from "../../constants";
import { ChannelLogo } from "app/pages/Campaigns/components";

const { Text } = Typography;
const { Search } = Input;

export function ChannelAndStoreFilters() {
    const {
        valuesKeyword,
        valuesChannel,
        valuesStore,
        valuesStatus,
        optionsChannel,
        mappedOptionsStore,
        onChangeKeyword,
        onChangeChannel,
        onChangeStore,
        onChangeStatus,
        valueVisibleToCreators,
        onChangeVisibleToCreators,
        valueHasDemoApprovals,
        onChangeHasDemoApprovals,
    } = useCampaignFilters({ baseRoute: '/campaign-manage/list-campaign' });

    // Render functions cho Channel
    const renderLabelChannel = (item: any) => {
        const channel = optionsChannel?.find((op: any) => op?.value == item?.value);
        return (
            <Flex gap={4} align="center">
                <ChannelLogo code={channel?.value || item?.value} />
                <Text>{item?.label}</Text>
            </Flex>
        );
    };

    const renderOptionsChannel = (option: any) => {
        return (
            <Flex gap={4} align="center">
                <ChannelLogo code={option?.data?.value} />
                <Text>{option?.label}</Text>
            </Flex>
        );
    };

    // Render functions cho Store
    const renderLabelStore = (item: any) => {
        const store = mappedOptionsStore?.find((op: any) => op?.value == item?.value);
        return (
            <Flex gap={4} align="center">
                <ChannelLogo code={store?.channel?.code} />
                <Text>{item?.label}</Text>
            </Flex>
        );
    };

    const renderOptionsStore = (option: any) => {
        return (
            <Flex gap={4} align="center">
                <ChannelLogo code={option?.data?.channel?.code} />
                <Text>{option?.label}</Text>
            </Flex>
        );
    };

    return (
        <Row gutter={[16, 16]} align="middle">
            {/* Search - keyword */}
            <Col xs={24} md={4}>
                <Search
                    key={valuesKeyword}
                    placeholder="Nhập tên hoặc ID chiến dịch"
                    defaultValue={valuesKeyword}
                    onSearch={onChangeKeyword}
                    style={{ width: '100%' }}
                    allowClear
                />
            </Col>

            {/* Channel - Sàn */}
            <Col xs={24} sm={12} md={4}>
                <Select
                    mode="multiple"
                    placeholder="Chọn sàn"
                    value={valuesChannel}
                    options={optionsChannel}
                    onChange={onChangeChannel}
                    allowClear
                    style={{ width: '100%' }}
                    labelRender={(item) => renderLabelChannel(item)}
                    optionRender={(option) => renderOptionsChannel(option)}
                    maxTagCount="responsive"
                />
            </Col>

            {/* Store - Tạm thời chưa làm */}
            <Col xs={24} sm={12} md={4}>
                <Select
                    mode="multiple"
                    placeholder="Chọn gian hàng"
                    value={valuesStore as any}
                    options={mappedOptionsStore}
                    onChange={onChangeStore}
                    allowClear
                    style={{ width: '100%' }}
                    labelRender={(item) => renderLabelStore(item)}
                    optionRender={(option) => renderOptionsStore(option)}
                    maxTagCount="responsive"
                />
            </Col>

            {/* Status - listStatus */}
            <Col xs={24} sm={12} md={4}>
                <Select
                    mode="multiple"
                    placeholder="Chọn trạng thái"
                    options={CAMPAIGN_STATUS_OPTIONS}
                    value={valuesStatus as any}
                    onChange={onChangeStatus}
                    allowClear
                    style={{ width: '100%' }}
                />
            </Col>

            {/* visibleToCreators filter */}
            <Col xs={24} sm={12} md={4}>
                <Select
                    placeholder="Chọn trạng thái hiển thị với nhà sáng tạo"
                    options={VISIBLE_TO_CREATORS_FILTER_OPTIONS}
                    value={valueVisibleToCreators}
                    onChange={onChangeVisibleToCreators}
                    allowClear
                    style={{ width: '100%' }}
                />
            </Col>

            {/* isVisibleToCreator */}
            <Col xs={24} sm={12} md={4}>
                <Select
                    placeholder="Chọn trạng thái duyệt demo"
                    options={REVIEW_DEMO_STATUS_OPTIONS}
                    value={valueHasDemoApprovals}
                    allowClear
                    style={{ width: '100%' }}
                    onChange={onChangeHasDemoApprovals}
                />
            </Col>

            {/* Commission value */}
            {/* <Col xs={24} sm={12} md={4}>
                <Input
                    disabled={!commissionType}
                    style={{ width: '100%' }}
                    addonBefore="Giá trị % HH ≥"
                    suffix="%"
                    placeholder="Nhập giá trị"
                />
            </Col> */}

        </Row>
    );
}