import React from 'react';

export interface ILetterItem {
  id: string
  letter?: React.ReactChild
}

export interface IAvatarProps {
  src: string
  title?: string
  lazyLoadingImage?: string
  letterItem?: ILetterItem
  type?: string
  size?: Object
  className?: string
  alt?: string
  sideElement?: React.ReactElement
  onError?: React.ReactEventHandler
  statusColorType?: string
  statusColor?: string
  statusText?: string
}

export interface IChatItemProps {
  id: string | number
  avatar: string
  unread?: number
  className?: string
  avatarFlexible?: boolean
  isShowCheckbox?: boolean
  alt?: string
  title?: string
  subtitle?: string
  date?: Date
  dateString?: string
  statusColor?: string
  statusColorType?: string
  statusText?: string
  lazyLoadingImage?: string
  muted?: boolean
  showMute?: boolean
  showVideoCall?: boolean
  onAvatarError?: React.MouseEventHandler
  onContextMenu?: React.MouseEventHandler
  onClick?: React.MouseEventHandler
  onClickMute?: React.MouseEventHandler
  onClickVideoCall?: React.MouseEventHandler
  onDragOver?: Function
  onDragEnter?: Function
  onDrop?: Function
  onDragLeave?: Function
  setDragStates?: Function
  onDragComponent?: any
  letterItem?: ILetterItem
  customStatusComponents?: React.ElementType<any>[]
}