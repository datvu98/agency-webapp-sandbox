import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLoginSliceSlice } from './slice';
import { useDispatch, useSelector } from 'react-redux';
import { selectLoginSlice } from './slice/selectors';
import { Button, Space, Switch, Typography } from 'antd';
import { useGlobalSliceSlice } from 'app/slice';
import { selectGlobalSlice } from 'app/slice/selectors';
import { showAlert } from 'utils/helper';

export function HomePage() {
  const { } = useLoginSliceSlice()
  const { actions } = useGlobalSliceSlice();
  const dispatch = useDispatch()
  const { now } = useSelector(selectLoginSlice)

  const { Text } = Typography;
  const { Title } = Typography;

  const info = useSelector(selectGlobalSlice)

  // const { payload, query } = useQuery(statusEmail())
  // const { mutate, loading } = useMutation(setStatusEmail)

  // console.log('payload___', payload);

  return (
    <>
      <Title>My Account</Title>
      <Space>
      </Space>
    </>
  );
}
