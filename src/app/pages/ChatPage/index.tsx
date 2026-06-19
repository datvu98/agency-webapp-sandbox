/**
 *
 * ChatPage
 *
 */
import { Affix, Button, Col, Divider, Flex, Layout, Menu, Popover, Row, Select, Slider, Space } from "antd";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from './Layout.styles'
import { SettingOutlined, TeamOutlined } from '@ant-design/icons';
import Conversation from "./Conversation";
import { useChatSliceSlice } from "./slice";
import { useDispatch } from "react-redux";
import MessageList from "./MessageList";
import ChatFilters from "./Conversation/components/ChatFilters";
import Information from "./Information";
import { Helmet } from "react-helmet-async";


interface Props { }


//TODO: get data from api
const Channels = [
  { value: 'fb', label: `Fb Messenger` }
]

export const ChatPage = ((props: Props) => {
  const { actions } = useChatSliceSlice()
  const dispatch = useDispatch()

  const [currentPage, setCurrentPage] = useState<string>('fb')
  const [expandInfo, setExpandInfo] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  // Handle resize height
  const [_, setWindowSize] = useState(window.innerHeight);

  const handleWindowResize = useCallback(event => {
    setWindowSize(window.innerHeight);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [handleWindowResize]);

  useEffect(() => {
    dispatch(actions.selectPage(currentPage))
  }, [currentPage])

  return <LayoutWrapper>
    <Helmet
      titleTemplate="Hội thoại - UpS"
      defaultTitle="Hội thoại - UpS"
    >
      <meta name="description" content="Hội thoại - UpS" />
    </Helmet>
    <Flex style={{ height: "calc(100vh - 64px)" }}>
      <Row style={{ width: '100%' }}>
        {/* <Col span={1}>
          <ChatFilters />
        </Col> */}
        <Col span={6} style={{ overflow: 'hidden' }} >
          <Conversation onShowExpand={() => setExpandInfo(true)} />
        </Col>
        <Col className="chat-message-wrapper" span={expandInfo ? 10 : 17}>
          <MessageList
            expandInfo={expandInfo}
            onExpandInfo={() => setExpandInfo(prev => !prev)}
          />
        </Col>
        <Col span={expandInfo ? 8 : 0}>
          <Information />
          {/* <Button type="primary" onClick={() => localStorage.setItem("localStorageKey", '12345678')}>
            Shared Local Storage
          </Button> */}
        </Col>
      </Row>
    </Flex>
  </LayoutWrapper>
});
