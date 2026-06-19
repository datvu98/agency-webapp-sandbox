import { CaretDownOutlined, CaretUpOutlined, FlagFilled, InfoCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { Carousel, Empty, Flex, Tooltip, Typography } from 'antd';
import React, { memo, useMemo, useRef, useState } from 'react';
import { ResponsiveObject } from "@ant-design/react-slick/types";
import { generateAvgTimestamp, generateDateDefault, generateDateRange } from '../../ReportHelper';
import { useReportContext } from 'app/contexts/ReportContext';
import { flattenDeep } from 'lodash';
import { formatNumberToCurrency, showAlert } from 'utils/helper';

const { Text } = Typography;
function hexToRGBA(hex, alpha) {
  hex = hex.replace('#', '');

  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);

  alpha = alpha || 1;

  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

const formatToBMK = (num) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  } else {
    return num.toFixed(2); // Keep the precision for smaller numbers
  }
};

const LineChart = (props: { chatData: any }) => {
  const [chooseOption, setChooseOption] = useState(props.chatData?.report_charts?.filter(option => option?.defaultSelected).map(option => option.title))
  const carouselRef = useRef<any>(null);
  const { variablesQuery } = useReportContext();
  const [currentSlide, setCurrentSlide] = useState<any>(0);
  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
      setCurrentSlide(prevSlide => prevSlide + 1)
    }
  };
  const handlePrev = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
      setCurrentSlide(prevSlide => prevSlide - 1)
    }
  };
  const variables = useMemo(() => {
    return {
      ...generateDateDefault(29, true),
      ...variablesQuery
    }
  }, [variablesQuery]);
  const lineChartLabel = useMemo(() => {
    return generateDateRange(variables.from, variables.to, variables?.type || 'day')
  }, [variables]);

  const flattenDeepChart = useMemo(() => {
    return flattenDeep(props.chatData?.report_charts?.map(item => {
      let parseValue = item?.data?.map(item => item.value);
      let maxValue = Math.max(...parseValue);
      return item?.data?.map(ele => {
        return {
          ...ele,
          value: formatNumberToCurrency(ele?.value),
          time: ele?.label,
          label: ele,
          category: item?.title,
          color: item?.color,
          description: item?.description,
          increase: item?.increase,
          tooltip: item?.tooltip,
          unit: item?.unit,
          total: item?.value,
          percentage: maxValue ? ele?.value / maxValue * 100 : 0
        }
      })
    }))
  }, [props.chatData]);
  const [newData, setNewData] = useState(flattenDeepChart.filter((item: any) => chooseOption.includes(item.category)))

  const config = {
    data: newData,
    xField: 'time',
    height: 350,
    yField: 'percentage',
    point: {
      shapeField: 'square',
      sizeField: 4,
    },
    tooltip: d => {
      return {
        name: `${d.time}`,
        value: d.category == "Thời gian phản hồi trung bình" ? `${generateAvgTimestamp(d.value)}` : `${d.value}`
      }
    },
    legend: false,
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 2,
    },
    colorField: "category",
    scale: {
      color: { range: [...new Set(newData.map((item: any) => item.color))] },
    },
    axis: {
      y: {
        line: {
          stroke: 'red',
          lineWidth: 4
        },
        labelFormatter: (v) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
        rotate: 90,
        label: {
          style: { fill: 'red' }
        }
      },
    },
  };

  const handleClick = (e: string) => {
    if (chooseOption.includes(e) && chooseOption.length > 1) {
      setChooseOption(chooseOption.filter(option => option !== e))
      setNewData(newData.filter((item: any) => {
        return item.category !== e
      }))
    } else if (chooseOption.includes(e) && chooseOption.length == 1) {
      showAlert.warn("Chỉ có thể chọn tối thiểu 1 chỉ số")
    } else if (!chooseOption.includes(e) && chooseOption.length == 4) {
      showAlert.warn("Chỉ có thể chọn tối đa 4 chỉ số")
    } else {
      setChooseOption(chooseOption.concat(e))
      setNewData(newData.concat(flattenDeepChart.filter((item: any) => item.category === e)))
    }
  };
  const responsiveSettings: ResponsiveObject[] = [
    { breakpoint: 768, settings: { slidesToShow: 1 } },
    { breakpoint: 900, settings: { slidesToShow: 2 } },
    { breakpoint: 1200, settings: { slidesToShow: 3 } },
    { breakpoint: 1500, settings: { slidesToShow: 3 } },
    { breakpoint: Infinity, settings: { slidesToShow: 4 } }
  ];
  const formatValue = (type: string, value: number) => {
    if (type == "Thời gian phản hồi trung bình") {
      return generateAvgTimestamp(value)
    } else if (type == "Tỷ lệ phản hồi chat") {
      return (value * 100).toFixed(2) + ' %'
    } else {
      return value
    }
  }
  const btnSlider = useMemo(() => {
    const totalSlides = props.chatData?.report_charts?.length || 0;
    const slidesToShow = carouselRef?.current?.innerSlider?.props?.slidesToShow || 1;

    return (
      <>
        {currentSlide !== 0 && <button className='banner-prev-btn' onClick={handlePrev}><LeftOutlined /></button>}
        {currentSlide !== totalSlides - slidesToShow && <button className='banner-next-btn' onClick={handleNext}><RightOutlined /></button>}</>
    )
  }, [currentSlide])
  const bannerEle = (bannerInfo) => {
    let bannerText = 'kì trước'
    return <div onClick={() => { handleClick(bannerInfo?.title) }}>
      <div className='banner-wrapper' style={chooseOption.includes(bannerInfo?.title) ? { borderTop: `6px solid ${bannerInfo.color}`, backgroundColor: `${hexToRGBA(bannerInfo?.color, 0.05)}` } : {}}>
        <div className='banner-header'>
          <span>{bannerInfo?.title}</span>
          <Tooltip title={bannerInfo?.tooltip}>
            <span><InfoCircleOutlined /></span>
          </Tooltip>
        </div>
        <p className="banner-statistic" >{formatNumberToCurrency(bannerInfo?.value)}</p>
        <div className='banner-footer'>
          <span>So với {bannerText}</span>
          {bannerInfo?.increase == null ? <span>--</span> : (
            <Flex align='center' gap={4}>
              {bannerInfo?.increase >= 0 ? <CaretUpOutlined style={{ color: 'green' }} /> : <CaretDownOutlined style={{ color: 'red' }} />}
              {Math.abs(bannerInfo?.increase * 100).toFixed(2)}%
            </Flex>
          )}
        </div>
      </div>
    </div>
  }
  return <div className='linechart-banner-wrapper'>
    <Text className="title-card" strong>Biểu đồ xu hướng</Text>
    <Carousel responsive={responsiveSettings} slidesToShow={4} dots={false} infinite={false} ref={carouselRef}>
      {props.chatData?.report_charts?.map(item => {
        return bannerEle(item)
      })}
    </Carousel>
    {btnSlider}
    {props?.chatData?.report_charts?.length ? <Line {...config} /> : <Empty
      className="empty-section"
      description="Chưa có dữ liệu"
    />}
  </div>;
};

export default memo(LineChart);
