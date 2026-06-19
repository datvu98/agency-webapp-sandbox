import React, { useMemo, useState } from "react";
import { Button, Col, Collapse, Flex, Row, Tag, Typography } from "antd";
import { OPTIONS_PROTOCOL, PRODUCT_TYPE_OPTIONS, STATUS_TYPE } from "../constants";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

const GeneralInfo = ({ dataDetail, optionsWarehouse, optionsBrand, optionSmes }) => {
	const [statusTitle, statusColor] = useMemo(() => {
		let title = "Đã hủy";
		if (dataDetail?.status == "complete") {
			title = "Đã duyệt";
		}  else if (dataDetail?.status == "new") {
			title = "Chờ duyệt";
		}
		return [title, dataDetail?.status == "cancel" || dataDetail?.status == "waiting" ? "#888484" : "#ff5629"];
	}, [dataDetail]);

    const warehouse = useMemo(() => {
        if(!dataDetail?.warehouseId || !optionsWarehouse?.length) return null
        return optionsWarehouse?.find(wh => wh?.value == dataDetail?.warehouseId)
    }, [dataDetail, optionsWarehouse])
    const ups = useMemo(() => {
        if(!dataDetail?.smeId || !optionSmes?.length) return null
        return optionSmes?.find(sme => sme?.value == dataDetail?.smeId)
    }, [dataDetail, optionSmes])

    const brand = useMemo(() => {
        if(!dataDetail?.brandId || !optionsBrand?.length) return null
        return optionsBrand?.find(brand => brand?.value == dataDetail?.brandId)
    }, [dataDetail, optionsBrand])

    const protocol = useMemo(() => {
        if(!dataDetail ) return null
        return OPTIONS_PROTOCOL?.find(prt => prt?.value == dataDetail?.protocol)
    }, [dataDetail])

    const statusType = useMemo(() => {
        if(!dataDetail ) return STATUS_TYPE[1]
        return STATUS_TYPE?.find(sttType => sttType?.value == dataDetail?.productVariantStatus) || STATUS_TYPE[1]
    }, [dataDetail])

    const productType = useMemo(() => {
        if(dataDetail?.productType == 2 ) return {
            value: 2,
            label: 'Loại hỗn hợp'
        }
        return PRODUCT_TYPE_OPTIONS?.find(prdType => prdType?.value == dataDetail?.productType)
    }, [dataDetail])
    console.log(dataDetail)
	return (
		<>
			<Collapse
				items={[
					{
						key: "general",
						label: (
							<Flex align="center" gap={10}>
								<Text>THÔNG TIN PHIẾU XUẤT KHO</Text>
								<Text strong style={{ color: statusColor, fontSize: 10 }}>
									{statusTitle}
								</Text>
							</Flex>
						),
						children: <>
                            <Row>
                                <Col span={12}>
                                    <Flex  vertical gap={4}>
                                        <Text>Mã phiếu xuất kho: <Text strong>{dataDetail?.code || '--'}</Text></Text>
                                        <Text>Kho: <Text strong>{warehouse?.label || '--'}</Text></Text>
                                        <Text>UpS: <Text strong>{ups?.label || '--'}</Text></Text>
                                        <Text>Nhãn hàng: <Text strong>{brand?.label || '--'}</Text></Text>
                                        <Text>Đơn vị vận chuyển: <Text strong>{dataDetail?.shippingCarrier|| '--'}</Text></Text>
                                        {/* <Text>Thông tin chứng từ: <Text strong className={` ${dataDetail?.evidenceUrl ? "cursor-pointer color-base" : ''}`} onClick={() => {
                                            if (!dataDetail?.evidenceUrl) {
                                                return
                                            }
                                            window.open(dataDetail?.evidenceUrl, '_blank')
                                        }}>{dataDetail?.evidenceUrl || '--'}</Text></Text> */}
                                    </Flex>
                                </Col>
                                <Col span={12}>
                                    <Flex  vertical gap={4}>
                                        <Text>Hình thức xuất kho: <Text strong>{protocol?.label || '--'}</Text></Text>
                                        <Text>Loại sản phẩm: <Text strong>{productType?.label || '--'}</Text></Text>
                                        <Text>Loại trạng thái: <Text strong>{statusType?.label || '--'}</Text></Text>
                                        {/* <Text>Thời gian nhận hàng dự kiến: <Text strong>{dataDetail?.estimatedDeliveryAt ? dayjs.unix(dataDetail?.estimatedDeliveryAt).format('DD/MM/YYYY HH:mm') : '--'}</Text></Text> */}
                                        <Text>Ghi chú: <Paragraph ellipsis={{rows: 3}}>{dataDetail?.note || '--'}</Paragraph></Text>
                                    </Flex>
                                </Col>
                            </Row>
                        </>,
					},
				]}
			/>
		</>
	);
};

export default GeneralInfo;
