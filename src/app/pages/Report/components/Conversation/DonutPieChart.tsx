import React, { memo, useMemo } from 'react';
import { Pie } from '@ant-design/plots';
import { Empty, Flex } from 'antd';
import { date } from 'yup';
import { useReportContext } from 'app/contexts/ReportContext';

const DonutPieChart = (props: { title: string, chatData: any }) => {

  const { optionsStore } = useReportContext()
  const pieChartData = useMemo(() => props.chatData?.data?.filter((_data) => _data?.value > 0)
    .map((_data) => {
      return {
        type: _data?.label,
        value: _data?.value
      }
    }), [optionsStore, props.chatData])


  const [COLOR_SHOPEE, COLOR_LAZADA, COLOR_TIKTOK] = [
    ['#FE5629', '#FF7F00', '#FF4500', '#FF8C00', '#EE7600', '#CD6600', '#FFA500', '#EE9A00', '#FF7F50',],
    ['#0a62f3', '#00008B', '#4169E1', '#4876FF', '#436EEE', '#3A5FCD', '#27408B', '#0000FF', '#0000FF', '#000080'],
    ['#323232', '#696969', '#1C1C1C', '#363636', '#4F4F4F', '#828282', '#9C9C9C', '#B5B5B5'],
  ]

  const optionStoreCOlor = useMemo(() => optionsStore?.map((_store, index) => {
    let colorStore = '';
    switch (_store.connector_channel_code) {
      case 'shopee':
        colorStore = COLOR_SHOPEE[index] || COLOR_SHOPEE[0];
        break;
      case 'lazada':
        colorStore = COLOR_LAZADA[index] || COLOR_LAZADA[0];
        break;
      case 'tiktok':
        colorStore = COLOR_TIKTOK[index] || COLOR_TIKTOK[0];
        break;
      default:
        return '#fff'
    }
    return { ..._store, color: colorStore }
  }), [optionsStore])

  const pieChartColor = useMemo(() => pieChartData?.map((_data) => {
    const itemWithColor = optionStoreCOlor?.find(item => item.id == _data.type)

    return { ..._data, color: itemWithColor?.color, title: itemWithColor?.label, logo_asset_url: itemWithColor?.channel?.logo_asset_url }
  }), [optionsStore, pieChartData])

  const middleText = props.chatData.total ? props.chatData.total : ""
  const config = {
    data: pieChartColor,
    angleField: 'value',
    colorField: 'title',
    innerRadius: 0.6,
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    width: 300,
    height: 300,
    animate: false,
    scale: { color: { range: pieChartColor.map(item => item.color) } },
    annotations: [
      {
        type: 'text',
        style: {
          text: `${middleText}`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 40,
          fontStyle: 'bold',
        },
      },
    ],
    tooltip: (d) => {
      return {
        name: `<img src='${d.logo_asset_url}' width='16' height='16'/>${d.title}`,
        value: d.value
      }
    },
    legend: {
      color: {
        position: 'top',
        layout: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      },
    },
  };
  return (
    <Flex align="center">
      {props.chatData?.total ? <Pie {...config} /> : <Empty
        className="empty-section"
        description="Chưa có dữ liệu"
      />
      }
    </Flex>
  )
    ;
};

export default memo(DonutPieChart);
