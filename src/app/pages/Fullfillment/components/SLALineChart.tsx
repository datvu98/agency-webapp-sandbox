import { CaretDownOutlined, CaretUpOutlined, InfoCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { Carousel, Empty, Flex, Spin, Tooltip, Typography } from 'antd';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ResponsiveObject } from "@ant-design/react-slick/types";
import { generateAvgTimestamp, generateDateDefault, generateDateRange } from '../../Report/ReportHelper';
import { useReportContext } from 'app/contexts/ReportContext';
import { flattenDeep } from 'lodash';
import { formatNumberToCurrency, showAlert } from 'utils/helper';
import query_report_fulfillmentChart from 'graphql/queries/query_report_fulfillmentChart';
import { useQuery } from '@apollo/client';

const { Text } = Typography;
function hexToRGBA(hex, alpha) {
    hex = hex.replace('#', '');

    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);

    alpha = alpha || 1;

    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

const SLALineChart = (props: { variables: any }) => {

    const { data: dataChart, loading } = useQuery(query_report_fulfillmentChart, {
        variables: {
            ...props?.variables
        },
        fetchPolicy: 'network-only'
    })

    const [chooseOption, setChooseOption] = useState<any>([])
    const [newData, setNewData] = useState<any>([])
    const carouselRef = useRef<any>(null);
    const [currentSlide, setCurrentSlide] = useState<any>(0);

    console.log(chooseOption)
    const flattenDeepChart = useMemo(() => {
        return flattenDeep(dataChart?.report_fulfillmentChart?.map(item => {
            let parseValue = item?.data?.map(item => item.value);
            let maxValue = Math.max(...parseValue);
            return item?.data?.map(ele => {
                return {
                    ...ele,
                    value: formatNumberToCurrency(ele?.value),
                    time: ele?.label,
                    category: item?.title,
                    color: item?.color,
                    description: item?.description,
                    increase: item?.increase,
                    tooltip: item?.tooltip,
                    unit: item?.unit,
                    total: item?.value,
                    percentage: ele?.value
                }
            })
        }))
    }, [dataChart?.report_fulfillmentChart]);
    useMemo(() => {
        setChooseOption(dataChart?.report_fulfillmentChart?.filter(option => option?.defaultSelected).map(option => option?.title))
    }, [dataChart])
    useMemo(() => {
        setNewData(flattenDeepChart.filter((item: any) => chooseOption?.includes(item.category)))
    }, [flattenDeepChart, chooseOption])
    const config = useMemo(() => {
        return {
            data: newData,
            xField: 'time',
            height: 350,
            yField: 'percentage',
            colorField: "category",
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
                    render: (event, { title, items }) => {
                        // Safely split the title
                        const realTitle = title?.split(',');

                        // Ensure chooseOption is defined and filter based on it
                        const choosed = chooseOption && Array.isArray(chooseOption)
                            ? items?.filter(item => chooseOption.includes(item?.name))
                            : [];

                        // Remove duplicates by filtering items based on unique names
                        const uniqueItems = choosed.filter((item, index, self) =>
                            index === self.findIndex(t => t.name === item.name)
                        );

                        // If no items are chosen, return an empty or default tooltip
                        if (!uniqueItems.length) {
                            return `
                            <div style="min-width: 200px; padding: 5px;">
                                <div style="text-align: center">
                                    ${realTitle?.length ? realTitle[0] : "No Data"}
                                </div>
                                <div style="padding: 5px; text-align: center;">No matching data found</div>
                            </div>
                            `;
                        }

                        return `
                        <div style="min-width: 200px; padding: 5px;">
                            <div style="text-align: center">
                                ${realTitle?.length ? realTitle[0] : ""}
                            </div>
                            ${uniqueItems.map(item => `
                                <div style="padding: 5px; display: flex; justify-content: space-between;">
                                    <span>
                                        <span style="background-color:${item.color}; width:8px; height:8px; display:inline-block; border-radius:50%; margin-right:5px;"></span>
                                        ${item.name}
                                    </span>
                                    <span>${item.value}</span>
                                </div>
                            `).join('')}
                        </div>
                        `;
                    }
                }
            },
            style: {
                lineWidth: 2,
            },
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
                    // label: {
                    // }
                },
            },
        }
    }, [newData, chooseOption]);

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
        { breakpoint: 1500, settings: { slidesToShow: 4 } },
        { breakpoint: Infinity, settings: { slidesToShow: 4 } }
    ];

    const bannerEle = (bannerInfo) => {
        let bannerText = 'kì trước'
        return <div onClick={() => { handleClick(bannerInfo?.title) }}>
            <div className='banner-wrapper' style={chooseOption?.includes(bannerInfo?.title) ? { borderTop: `6px solid ${bannerInfo.color}`, backgroundColor: `${hexToRGBA(bannerInfo?.color, 0.05)}` } : {}}>
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

    const btnSlider = useMemo(() => {
        return (
            <>
                {currentSlide !== 0 && <button className='banner-prev-btn' onClick={handlePrev}><LeftOutlined /></button>}
                {currentSlide !== carouselRef?.current?.innerSlider?.state?.lazyLoadedList?.length - 1 && <button className='banner-next-btn' onClick={handleNext}><RightOutlined /></button>}</>
        )
    }, [currentSlide])

    return <div className='linechart-banner-wrapper'>
        <Spin spinning={loading}>
            {!loading && <><Carousel responsive={responsiveSettings} slidesToShow={4} dots={false} infinite={false} ref={carouselRef}>
                {dataChart?.report_fulfillmentChart?.map(item => {
                    return bannerEle(item)
                })}
            </Carousel>
                {btnSlider}
                <Line {...config} /></>}
        </Spin>
    </div>;
};

export default SLALineChart;
