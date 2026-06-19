import { ClockCircleOutlined, HomeOutlined, MessageOutlined, ShopOutlined, TagsOutlined } from '@ant-design/icons';
import { Button, Checkbox, Empty, Flex, Popover, Space, Typography } from "antd";
import classNames from 'classnames';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'querystring';
import { useLayoutContext } from 'app/contexts/LayoutContext';

interface IOpenFilters {
    message: boolean,
    time: boolean,
    store: boolean,
    label: boolean,
    sme: boolean
}

interface ICheckedFilters {
    message: number[],
    time: number[],
    store: number[],
    label: number[],
    sme: number[],
    smeLabel: number[]
}

interface IOptionsFilter {
    value: number,
    label: string
}

const OPTIONS_FILTER_MESSAGE: IOptionsFilter[] = [
    { value: 1, label: 'Tin nhắn chưa đọc' },
    { value: 2, label: 'Tin nhắn đã đọc và chưa phản hồi' },
    { value: 3, label: 'Tin nhắn đã phản hồi' },
];

const OPTIONS_FILTER_TIME: IOptionsFilter[] = [
    { value: 1, label: 'Tin nhắn còn hạn' },
    { value: 2, label: 'Tin nhắn quá hạn' },
];

const ChatFilters = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const { dataConversationLabel, optionsStore, optionSmes } = useLayoutContext();
    console.log(optionSmes)
    const [openFilters, setOpenFilters] = useState<IOpenFilters>({
        message: false,
        time: false,
        store: false,
        label: false,
        sme: false,
    });
    const [checked, setChecked] = useState<ICheckedFilters>({
        message: [],
        time: [],
        store: [],
        label: [],
        sme: [],
        smeLabel: []
    });

    useEffect(() => {
        setChecked(prev => ({
            ...prev,
            message: params?.filterStatus?.length > 0 ? params?.filterStatus?.split(',')?.map(item => +item) : [],
            time: params?.filterReplyExpired?.length > 0 ? params?.filterReplyExpired?.split(',')?.map(item => +item) : [],
            store: params?.filterConversationStores?.length > 0 ? params?.filterConversationStores?.split(',')?.map(item => +item) : [],
            label: params?.filterLabels?.length > 0 ? params?.filterLabels?.split(',')?.map(item => +item) : [],
            sme: params?.filterSme?.length > 0 ? params?.filterSme?.split(',')?.map(item => +item) : [],
            smeLabel: params?.filterSmeLabel?.length > 0 ? params?.filterSmeLabel?.split(',')?.map(item => +item) : []
        }))
    }, [])

    console.log(optionsStore)

    return (
        <div className='chat-filter-container'>
            <Popover
                title="Lọc trạng thái tin nhắn"
                className={classNames('chat-filter-item', { active: openFilters.message || checked.message.length > 0 })}
                placement="rightTop"
                trigger="click"
                content={
                    <Space className="w-100" direction="vertical" size={15}>
                        <Flex vertical>
                            {OPTIONS_FILTER_MESSAGE.map((item: IOptionsFilter, index: number) => {
                                const isChecked = checked.message.some((mess: number) => mess == item.value);

                                return (
                                    <Checkbox
                                        key={`filter-mess-${index}`}
                                        checked={isChecked}
                                        style={{ marginBottom: 4 }}
                                        onChange={e => {
                                            const isNewCheck = e.target.checked;
                                            setChecked(prev => {

                                                return {
                                                    ...prev,
                                                    message: isNewCheck
                                                        ? prev.message.concat(item.value)
                                                        : prev.message.filter((mess: number) => mess != item.value)
                                                }
                                            })
                                        }}
                                    >
                                        {item?.label}
                                    </Checkbox>
                                )
                            })}
                        </Flex>
                        <Flex align="center" justify="center">
                            <Button
                                type="primary"
                                onClick={() => {
                                    setOpenFilters(prev => ({
                                        ...prev,
                                        message: false
                                    }));
                                    navigate(`/chats?${queryString.stringify({
                                        ...params,
                                        filterStatus: checked.message.join(','),
                                    })}`.replaceAll('%2C', '\,'));
                                }}
                            >
                                Ok
                            </Button>
                        </Flex>
                    </Space>
                }
                open={openFilters.message}
                onOpenChange={(newOpen) => setOpenFilters(prev => ({ ...prev, message: newOpen }))}
            >
                <MessageOutlined />
            </Popover>
            <Popover
                title="Lọc thời hạn phản hồi"
                className={classNames('chat-filter-item', { active: openFilters.time || checked.time.length > 0 })}
                placement="rightTop"
                trigger="click"
                content={
                    <Space className="w-100" direction="vertical" size={15}>
                        <Flex vertical>
                            {OPTIONS_FILTER_TIME.map((item: IOptionsFilter, index: number) => {
                                const isChecked = checked.time.some((mess: number) => mess == item.value);

                                return (
                                    <Checkbox
                                        key={`filter-mess-${index}`}
                                        checked={isChecked}
                                        style={{ marginBottom: 4 }}
                                        onChange={e => {
                                            const isNewCheck = e.target.checked;
                                            setChecked(prev => {

                                                return {
                                                    ...prev,
                                                    time: isNewCheck
                                                        ? prev.time.concat(item.value)
                                                        : prev.time.filter((mess: number) => mess != item.value)
                                                }
                                            })
                                        }}
                                    >
                                        {item?.label}
                                    </Checkbox>
                                )
                            })}
                        </Flex>
                        <Flex align="center" justify="center">
                            <Button
                                type="primary"
                                onClick={() => {
                                    setOpenFilters(prev => ({
                                        ...prev,
                                        time: false
                                    }));
                                    navigate(`/chats?${queryString.stringify({
                                        ...params,
                                        filterReplyExpired: checked.time.join(','),
                                    })}`.replaceAll('%2C', '\,'));
                                }}
                            >
                                Ok
                            </Button>
                        </Flex>
                    </Space>
                }
                open={openFilters.time}
                onOpenChange={(newOpen) => setOpenFilters(prev => ({ ...prev, time: newOpen }))}
            >
                <ClockCircleOutlined />
            </Popover>
            <Popover
                title="Lọc gian hàng"
                className={classNames('chat-filter-item', { active: openFilters.sme || checked.sme.length > 0 })}
                placement="rightTop"
                trigger="click"
                open={openFilters.sme}
                onOpenChange={(newOpen) => setOpenFilters(prev => ({ ...prev, sme: newOpen }))}
                content={optionSmes?.length > 0 ? <Space className="w-100" direction="vertical" size={15}>
                    <Flex vertical style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {optionSmes?.map(item => ({
                            value: item?.sme_id,
                            label: item?.full_name || item?.email,
                        })).map((item: any, index: number) => {
                            const isChecked = checked.sme.some((mess: number) => mess == item.value);

                            return (
                                <>
                                    <Checkbox
                                        key={`filter-mess-${index}`}
                                        checked={isChecked}
                                        style={{ marginBottom: 4 }}
                                        onChange={e => {
                                            const isNewCheck = e.target.checked;
                                            const storeInSme = optionsStore?.filter(store => store?.sme_id == item?.value).map(item => item?.id);
                                            setChecked(prev => {
                                                return {
                                                    ...prev,
                                                    sme: isNewCheck
                                                        ? prev.sme.concat(item.value)
                                                        : prev.sme.filter((mess: number) => mess != item.value),
                                                    store: !isNewCheck ? prev.store.filter(mess => !storeInSme?.includes(mess)) : prev.store
                                                }
                                            })
                                        }}
                                    >
                                        <Flex align="center" gap={4}>
                                            <Typography.Text>{item?.label}</Typography.Text>
                                        </Flex>
                                    </Checkbox>
                                    {isChecked && <Flex vertical style={{ marginLeft: '10px' }}>
                                        {optionsStore?.filter(store => store?.sme_id == item?.value)?.map(item => ({
                                            value: item?.id,
                                            label: item?.name,
                                            logo: item?.channel?.logo_asset_url
                                        })).map((item: any, index: number) => {
                                            const isCheckedStore = checked.store.some((mess: number) => mess == item.value);

                                            return (
                                                <Checkbox
                                                    key={`filter-mess-${index}`}
                                                    checked={isCheckedStore}
                                                    style={{ marginBottom: 4 }}
                                                    onChange={e => {
                                                        const isNewCheck = e.target.checked;
                                                        setChecked(prev => {

                                                            return {
                                                                ...prev,
                                                                store: isNewCheck
                                                                    ? prev.store.concat(item.value)
                                                                    : prev.store.filter((mess: number) => mess != item.value)
                                                            }
                                                        })
                                                    }}
                                                >
                                                    <Flex align="center" gap={4}>
                                                        <img src={item?.logo} style={{ width: 16, height: 16, borderRadius: 4 }} />
                                                        <Typography.Text>{item?.label}</Typography.Text>
                                                    </Flex>
                                                </Checkbox>
                                            )
                                        })}
                                    </Flex>}
                                </>
                            )
                        })}
                    </Flex>
                    <Flex align="center" justify="center">
                        <Button
                            type="primary"
                            onClick={() => {
                                setOpenFilters(prev => ({
                                    ...prev,
                                    sme: false
                                }));
                                navigate(`/chats?${queryString.stringify({
                                    ...params,
                                    filterConversationStores: checked.store.join(','),
                                    filterSme: checked.sme.join(',')
                                })}`.replaceAll('%2C', '\,'));
                            }}
                        >
                            Ok
                        </Button>
                    </Flex>
                </Space> : <Flex justify='center' align='center'>
                    <Empty description="Chưa kết nối UpS" />
                </Flex>}
            >
                <HomeOutlined />
            </Popover>
            <Popover
                title="Lọc theo UpS"
                className={classNames('chat-filter-item', { active: openFilters.label || checked.smeLabel.length > 0 })}
                placement="rightTop"
                trigger="click"
                open={openFilters.label}
                onOpenChange={(newOpen) => setOpenFilters(prev => ({ ...prev, label: newOpen }))}
                content={dataConversationLabel?.conversationLabelList?.items?.length > 0 ? <Space className="w-100" direction="vertical" size={15}>
                    <Flex vertical style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {optionSmes?.map(item => ({
                            value: item?.sme_id,
                            label: item?.email,
                        })).map((item: any, index: number) => {
                            const isChecked = checked.smeLabel.some((mess: number) => mess == item.value);

                            return (
                                <>
                                    <Checkbox
                                        key={`filter-mess-${index}`}
                                        checked={isChecked}
                                        style={{ marginBottom: 4 }}
                                        onChange={e => {
                                            const isNewCheck = e.target.checked;
                                            const labelInSme = dataConversationLabel?.conversationLabelList?.items?.filter(label => label?.smeId == item?.value).map(item => item?.id);
                                            setChecked(prev => {
                                                return {
                                                    ...prev,
                                                    smeLabel: isNewCheck
                                                        ? prev.smeLabel.concat(item.value)
                                                        : prev.smeLabel.filter((mess: number) => mess != item.value),
                                                    label: !isNewCheck ? prev.label.filter(mess => !labelInSme?.includes(mess)) : prev.label
                                                }
                                            })
                                        }}
                                    >
                                        <Flex align="center" gap={4}>
                                            <Typography.Text>{item?.label}</Typography.Text>
                                        </Flex>
                                    </Checkbox>
                                    {isChecked && <Flex vertical style={{ marginLeft: '10px' }}>
                                        {dataConversationLabel?.conversationLabelList?.items?.filter(label => label?.smeId == item?.value)?.map(item => ({
                                            value: item?.id,
                                            label: item?.title
                                        })).map((item: IOptionsFilter, index: number) => {
                                            const isChecked = checked.label.some((mess: number) => mess == item.value);

                                            return (
                                                <Checkbox
                                                    key={`filter-mess-${index}`}
                                                    checked={isChecked}
                                                    style={{ marginBottom: 4 }}
                                                    onChange={e => {
                                                        const isNewCheck = e.target.checked;
                                                        setChecked(prev => {

                                                            return {
                                                                ...prev,
                                                                label: isNewCheck
                                                                    ? prev.label.concat(item.value)
                                                                    : prev.label.filter((mess: number) => mess != item.value)
                                                            }
                                                        })
                                                    }}
                                                >
                                                    {item?.label}
                                                </Checkbox>
                                            )
                                        })}
                                    </Flex>}
                                </>
                            )
                        })}
                    </Flex>

                    <Flex align="center" justify="center">
                        <Button
                            type="primary"
                            onClick={() => {
                                setOpenFilters(prev => ({
                                    ...prev,
                                    label: false
                                }));
                                navigate(`/chats?${queryString.stringify({
                                    ...params,
                                    filterLabels: checked.label.join(','),
                                    filterSmeLabel: checked.smeLabel.join(','),
                                })}`.replaceAll('%2C', '\,'));
                            }}
                        >
                            Ok
                        </Button>
                    </Flex>
                </Space> : <Flex justify='center' align='center'>
                    <Empty description="Chưa có nhãn dán" />
                </Flex>}
            >
                <TagsOutlined />
            </Popover>
        </div>
    )
};

export default memo(ChatFilters);