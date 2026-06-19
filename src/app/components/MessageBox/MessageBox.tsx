import React, { Fragment, useEffect, useMemo, useRef } from 'react';
import './MessageBox.css';

import PhotoMessage from '../PhotoMessage/PhotoMessage';

import { MdCheck, MdDelete, MdDoneAll, MdMessage } from 'react-icons/md';
import { RiShareForwardFill } from 'react-icons/ri';
import { TiArrowForward } from 'react-icons/ti';

import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Tooltip, Typography } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import OrderMessage from '../OrderMessage';
import ProductMessage from '../ProductMessage';
import SystemMessage from '../SystemMessage/SystemMessage';

const { Text } = Typography;
const PUSH_INIT = 0;
const PUSH_SUCCESS = 10;
const PUSH_ERROR = 2;

const MessageBox: React.FC<any> = ({ focus = false, notch = true, styles, ...props }) => {
  const prevProps = useRef(focus)
  const messageRef = useRef<HTMLDivElement>(null)

  var positionCls = classNames('rce-mbox', { 'rce-mbox-right': props.position === 'right' }, { 'border-box-error': props?.pushStatus == PUSH_ERROR })
  var thatAbsoluteTime =
    !/(text|video|file|meeting|audio)/g.test(props.type || 'text') && !(props.type === 'location' && props.text)
  const dateText = props.date && props.dateString

  useEffect(() => {
    if (prevProps.current !== focus && focus === true) {
      if (messageRef) {
        messageRef.current?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        })

        props.onMessageFocused(prevProps)
      }
    }
    prevProps.current = focus
  }, [focus, prevProps]);

  const [hasAvatar, avatarView] = useMemo(() => {
    if (props?.position == 'left' && props?.customer) {
      return [true, <Fragment>
        {!!props?.customer?.logo ? (
          <Avatar
            className="header-avatar"
            alt="avatar"
            style={{ width: 40, height: 40, marginLeft: 10, marginTop: 12 }}
            src={props?.customer?.logo}
          />
        ) : (
          <Avatar
            className="header-avatar"
            alt="avatar"
            icon={!props?.customer?.name ? <UserOutlined /> : null}
            style={{ width: 40, height: 40, marginLeft: 10, marginTop: 12 }}
          >
            {props?.customer?.name?.slice(0, 1).toUpperCase()}
          </Avatar>
        )}
      </Fragment>]
    }

    if (props?.position == 'right' && props?.user) {
      return [true, <Fragment>
        {!!props?.user?.avatar_url ? (
          <Avatar
            className="header-avatar"
            alt="avatar"
            style={{ width: 40, height: 40, marginRight: 10, marginTop: 12 }}
            src={props?.user?.avatar_url}
          />
        ) : (
          <Avatar
            className="header-avatar"
            alt="avatar"
            icon={!props?.user?.email ? <UserOutlined /> : null}
            style={{ width: 40, height: 40, marginRight: 10, marginTop: 12 }}
          >
            {props?.user?.email?.slice(0, 1).toUpperCase()}
          </Avatar>
        )}
      </Fragment>]
    }

    return [false, <Avatar
      className="header-avatar"
      alt="avatar"
      icon={<UserOutlined />}
      style={{ width: 40, height: 40, ...(props?.position == 'left' ? { marginLeft: 10 } : { marginRight: 10 }) }}
    />]
  }, [props]);

  return (
    <Flex vertical>
      <div ref={messageRef} className={classNames('rce-container-mbox', props.className)} onClick={props.onClick}>
        {props.renderAddCmp instanceof Function ? props.renderAddCmp() : props.renderAddCmp}
        {props.type === 'system' ? (
          <SystemMessage {...props} focus={focus} notch={notch} />
        ) : (
          <Flex
            align="start"
            style={{ flexDirection: props.position === 'left' ? 'row' : 'row-reverse' }}
          >
            <div style={{ visibility: hasAvatar ? 'unset' : 'hidden' }}>
              {avatarView}
            </div>
            <div
              style={styles}
              className={classNames(
                positionCls,
                { 'rce-mbox--clear-padding': thatAbsoluteTime },
                { 'rce-mbox--clear-notch': !notch },
                { 'message-focus': focus }
              )}
            >
              <div className='rce-mbox-body' onContextMenu={props.onContextMenu}>
                {!props.retracted && props.forwarded === true && (
                  <div
                    className={classNames(
                      'rce-mbox-forward',
                      { 'rce-mbox-forward-right': props.position === 'left' },
                      { 'rce-mbox-forward-left': props.position === 'right' }
                    )}
                    onClick={props.onForwardClick}
                  >
                    <RiShareForwardFill />
                  </div>
                )}

                {!props.retracted && props.replyButton === true && (
                  <div
                    className={
                      props.forwarded !== true
                        ? classNames(
                          'rce-mbox-forward',
                          { 'rce-mbox-forward-right': props.position === 'left' },
                          { 'rce-mbox-forward-left': props.position === 'right' }
                        )
                        : classNames(
                          'rce-mbox-forward',
                          { 'rce-mbox-reply-btn-right': props.position === 'left' },
                          { 'rce-mbox-reply-btn-left': props.position === 'right' }
                        )
                    }
                    onClick={props.onReplyClick}
                  >
                    <MdMessage />
                  </div>
                )}

                {!props.retracted && props.removeButton === true && (
                  <div
                    className={
                      props.forwarded === true
                        ? classNames(
                          'rce-mbox-remove',
                          { 'rce-mbox-remove-right': props.position === 'left' },
                          { 'rce-mbox-remove-left': props.position === 'right' }
                        )
                        : classNames(
                          'rce-mbox-forward',
                          { 'rce-mbox-reply-btn-right': props.position === 'left' },
                          { 'rce-mbox-reply-btn-left': props.position === 'right' }
                        )
                    }
                    onClick={props.onRemoveMessageClick}
                  >
                    <MdDelete />
                  </div>
                )}

                {(props.title || props.avatar) && (
                  <div
                    style={{ ...(props.titleColor && { color: props.titleColor }) }}
                    onClick={props.onTitleClick}
                    className={classNames('rce-mbox-title', {
                      'rce-mbox-title--clear': props.type === 'text',
                    })}
                  >
                    {/* {props.avatar && <Avatar letterItem={props.letterItem} src={props.avatar} />} */}
                    {props.title && <span>{props.title}</span>}
                  </div>
                )}

                {props.forwardedMessageText ? (
                  <div className='rce-mbox-forwardedMessage'>
                    <div className='rce-mbox-forwarded-message'>
                      <TiArrowForward fontSize={18} />
                      <i style={{ margin: '0 3px 1px 0' }}> {props.forwardedMessageText}</i>
                    </div>
                  </div>
                ) : null}

                {/* {!props.forwardedMessageText && props.reply ? (
              <ReplyMessage onClick={props.onReplyMessageClick} {...props.reply} />
            ) : null} */}

                {props.type === 'text' && (
                  <div
                    className={classNames('rce-mbox-text', {
                      'rce-mbox-text-retracted': props.retracted,
                      'left': props.position === 'left',
                      'right': props.position === 'right',
                    })}
                    dangerouslySetInnerHTML={{ __html: props.text?.replaceAll('\n', '<br />') }}
                  />
                )}

                {props.type === 'photo' && <PhotoMessage focus={focus} notch={notch} {...props} />}
                {props.type === 'order' && <OrderMessage order={props?.data} />}
                {props.type === 'item' && <ProductMessage product={props?.data} />}

                {/* {props.type === 'location' && <LocationMessage focus={focus} notch={notch} {...props} />}
            {props.type === 'video' && <VideoMessage focus={focus} notch={notch} {...props} />}
            {props.type === 'file' && <FileMessage focus={focus} notch={notch} {...props} />}
            {props.type === 'spotify' && <SpotifyMessage focus={focus} notch={notch} {...props} />}
            {props.type === 'meeting' && <MeetingMessage focus={focus} notch={notch} {...props} />}
            {props.type === 'audio' && <AudioMessage focus={focus} notch={notch} {...props} />}
            {props.type === 'meetingLink' && (
              <MeetingLink focus={focus} notch={notch} {...props} actionButtons={props?.actionButtons} />
            )} */}

                <div
                  title={props.statusTitle}
                  className={classNames(
                    'rce-mbox-time',
                    { 'rce-mbox-time-block': thatAbsoluteTime },
                    { 'non-copiable': !props.copiableDate }
                  )}
                  data-text={props.copiableDate ? undefined : dateText}
                >
                  <span>
                    {props.copiableDate && props.date && props.dateString}
                  </span>
                  {props.position == 'right' && <span className='rce-mbox-status'>
                    {props?.pushStatus == PUSH_INIT && <MdCheck color='#4FC3F7' />}
                    {props?.pushStatus != PUSH_INIT && <Tooltip title={!!props?.sentAt ? moment.unix(props?.sentAt / 1000).format('dddd DD/MM/YYYY HH:mm') : ''} placement="bottom">
                      <MdDoneAll color='#4FC3F7' />
                    </Tooltip>
                    }
                  </span>}
                </div>
              </div>
            </div>
          </Flex>
        )}
      </div>
      {props?.pushStatus == PUSH_ERROR && (
        <Flex
          style={props?.position == 'left' ? { marginLeft: 62 } : { marginRight: 62 }}
          justify={props?.position == 'left' ? 'start' : "end"}
          align='center'
          gap={8}
        >
          <Tooltip placement="bottom" title="Gửi lại">
            <ReloadOutlined className='cursor-pointer' style={{ color: '#f5222d' }} />
          </Tooltip>
          <Text type="danger">{props?.pushErrorMessage}</Text>
        </Flex>
      )}
    </Flex>
  )
}

export default MessageBox
