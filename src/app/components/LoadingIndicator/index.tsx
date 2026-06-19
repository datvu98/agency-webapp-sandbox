import * as React from 'react';

import Circle from './Circle';
import Wrapper from './Wrapper';
import { Spin } from 'antd';

const LoadingIndicator = () => (
  <Wrapper>
    <Spin size="large">
      <div className="content" />
    </Spin>
  </Wrapper>
);

export default LoadingIndicator;
