import React, { Key, memo, useEffect, useState } from 'react';
// import Avatar from '../Avatar';
import classNames from 'classnames'
import { IChatItemProps } from '../types';
import ChatItemWrapper from './ChatItem.style';
import { Avatar, Badge, Checkbox, Flex, Popover, Space, Tag, Tooltip, Typography } from 'antd';
import { CheckCircleFilled, FileImageOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

// const ChatItem: React.FC<IChatItemProps> = ({
const ChatItem: React.FC<any> = ({
    avatarFlexible = false,
    date = new Date(),
    unread = 0,
    statusColorType = 'badge',
    lazyLoadingImage = undefined,
    onAvatarError = () => void 0,
    isChecked,
    isSelected,
    onCheck,
    tags,
    ...props
}) => {
    const [onHoverTool, setOnHoverTool] = useState(false)
    const [onDrag, setOnDrag] = useState(false)

    useEffect(() => {
        props.setDragStates?.(setOnDrag)
    }, [])

    const handleOnMouseEnter = () => {
        setOnHoverTool(true)
    }

    const handleOnMouseLeave = () => {
        setOnHoverTool(false)
    }

    const handleOnClick = (e: React.MouseEvent) => {
        e.preventDefault()

        if (onHoverTool === true) return

        props.onClick?.(e)
    }

    const onDragOver = (e: React.MouseEvent) => {
        e.preventDefault()
        if (props.onDragOver instanceof Function) props.onDragOver(e, props.id)
    }

    const onDragEnter = (e: React.MouseEvent) => {
        e.preventDefault()
        if (props.onDragEnter instanceof Function) props.onDragEnter(e, props.id)
        if (!onDrag) setOnDrag(true)
    }

    const onDragLeave = (e: React.MouseEvent) => {
        e.preventDefault()
        if (props.onDragLeave instanceof Function) props.onDragLeave(e, props.id)
        if (onDrag) setOnDrag(false)
    }

    const onDrop = (e: React.MouseEvent) => {
        e.preventDefault()
        if (props.onDrop instanceof Function) props.onDrop(e, props.id)
        if (onDrag) setOnDrag(false)
    }

    return (
        <ChatItemWrapper>
            <div
                key={props.id as Key}
                className={classNames('rce-container-citem', props.className)}
                onClick={handleOnClick}
                onContextMenu={props.onContextMenu}
            >
                <div className={classNames('chat-citem', { 'active': isSelected })} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop}>
                    {!!props.onDragComponent && onDrag && props.onDragComponent(props.id)}
                    {((onDrag && !props.onDragComponent) || !onDrag) && [
                        props.isShowCheckbox ? <Checkbox
                            style={{ marginLeft: 10 }}
                            checked={isChecked}
                            disabled={props?.isDisable}
                            onClick={onCheck}
                            onChange={() => { }}
                        /> : null,
                        <div
                            key={'avatar'}
                            className={classNames('rce-citem-avatar', { 'rce-citem-status-encircle': statusColorType === 'encircle' })}
                        >
                            {!!props?.avatar ? (
                                <Avatar
                                    className="header-avatar"
                                    alt="avatar"
                                    style={{ width: 40, height: 40 }}
                                    src={props?.avatar}
                                />
                            ) : (
                                <Avatar
                                    className="header-avatar"
                                    alt="avatar"
                                    icon={!props?.title ? <UserOutlined /> : null}
                                    style={{ width: 40, height: 40 }}
                                >
                                    {props?.title?.slice(0, 1).toUpperCase()}
                                </Avatar>
                            )}
                        </div>,
                        <div key={'rce-citem-body'} className='rce-citem-body'>
                            <div className='rce-citem-body--top'>
                                <div className='rce-citem-body--top-title'>{props.title}</div>
                                {props?.expiredTime ? (
                                    <div className='rce-citem-body--top-time'>
                                        {date && props.dateString} / <Typography.Text style={{ color: props?.colorExpiredTime }}>{props?.expiredTime}</Typography.Text>
                                    </div>
                                ) : (
                                    <div className='rce-citem-body--top-time'>
                                        {date && props.dateString}
                                    </div>
                                )}
                            </div>

                            <div className='rce-citem-body--bottom'>
                                <div className='rce-citem-body--bottom-title'>
                                    {props?.lastMessageType == 'text' && <Paragraph
                                        style={{ fontWeight: unread && unread > 0 ? 'bold' : 'unset', margin: 0 }}
                                        ellipsis={{ rows: 1, tooltip: props.subtitle }}
                                    >
                                        {props.subtitle}
                                    </Paragraph>}
                                    {props?.lastMessageType == 'image' && <Flex gap={4}>
                                        <Text style={{ fontWeight: unread && unread > 0 ? 'bold' : 'unset' }}>[Hình ảnh]</Text>
                                    </Flex>}
                                    {props?.lastMessageType == 'order' && <Flex gap={4}>
                                        <Text style={{ fontWeight: unread && unread > 0 ? 'bold' : 'unset' }}>[Đơn hàng]</Text>
                                    </Flex>}
                                    {props?.lastMessageType == 'item' && <Flex gap={4}>
                                        <Text style={{ fontWeight: unread && unread > 0 ? 'bold' : 'unset' }}>[Sản phẩm]</Text>
                                    </Flex>}
                                </div>
                                {props?.isReplied ? <CheckCircleFilled style={{ color: '#52c41a', fontSize: 18 }} /> : null}
                                {unread && unread > 0 ? <Badge count={unread} overflowCount={5} /> : null}
                                {props.customStatusComponents !== undefined ? props.customStatusComponents.map(Item => <Item />) : null}
                            </div>
                            <Flex style={{ marginTop: 8 }} align="center" justify="space-between">
                                {!!props?.store ? <Flex align='center' gap={4}>
                                    <img width={16} height={16} style={{ borderRadius: 4 }} src={props?.store?.channel?.logo_asset_url} />
                                    <Typography.Text style={{ fontSize: 12 }}>{props?.store?.name}</Typography.Text>
                                </Flex> : <Flex><Typography.Text></Typography.Text></Flex>}
                                <Flex align="center" gap="4px">
                                    {tags?.map(tag => {
                                        if (tag?.title?.length > 12) {
                                            return <Tooltip placement="bottom" title={tag?.title}>
                                                <Tag color={tag?.color}>
                                                    {tag?.title?.slice(0, 12)}...
                                                </Tag>
                                            </Tooltip>
                                        }

                                        return <Tag color={tag?.color}>
                                            {tag?.title?.slice(0, 12)}
                                        </Tag>
                                    })}
                                </Flex>
                            </Flex>
                        </div>,
                    ]}
                </div>
            </div>
        </ChatItemWrapper>
    )
}

export default memo(ChatItem);
