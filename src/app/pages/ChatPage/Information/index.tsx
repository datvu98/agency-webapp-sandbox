import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import React, { memo, useContext } from "react";
import { lazyLoad } from 'utils/loadable';
import TabInfo from "./TabInfo";
import TabOrder from './TabOrder';
import { SocketContext } from 'app/contexts/SocketContext';

const Information = () => {
    const { setCurrentSegmented, currentTab, setCurrentTab } = useContext(SocketContext);
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Thông tin',
            children: <TabInfo />,
        },
        // {
        //     key: '2',
        //     label: 'Tạo đơn hàng',
        //     children: <TabOrder />,
        // },
    ]

    return (
        <div className="chat-information-wrapper">
            <Tabs
                className="chat-information-tabs"
                centered
                activeKey={currentTab}
                items={items}
                size="middle"
                onChange={(value) => {
                    setCurrentTab(value);
                    setCurrentSegmented('customer');
                }}
            />
        </div>
    )
};

export default memo(Information);