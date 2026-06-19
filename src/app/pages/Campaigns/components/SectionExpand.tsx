import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

interface SectionExpandProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  titleStyle?: React.CSSProperties;
  wrapperRef?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
}

const SectionExpand = ({
  title,
  children,
  defaultExpanded = true,
  titleStyle,
  wrapperRef,
  style,
}: SectionExpandProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div ref={wrapperRef} style={style}>
      <Flex
        align="center"
        gap={8}
        style={{ cursor: 'pointer', marginBottom: isExpanded ? 8 : 0, ...titleStyle }}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <Text style={{ fontSize: 14, fontWeight: 600 }}>{title}</Text>
        {isExpanded ? <DownOutlined style={{ fontSize: 11 }} /> : <RightOutlined style={{ fontSize: 11 }} />}
      </Flex>
      <div className={`section-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="section-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionExpand;
