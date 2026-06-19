import React, { useMemo } from "react";
import { Col, Collapse, Divider, Flex, Row, Spin, Tabs, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import queryString from 'querystring'
import { omit } from "lodash";
import { useQuery } from "@apollo/client";
import query_workWithPagination from "graphql/queries/query_workWithPagination";
import { CollapseProps } from "antd/lib/collapse";

const { Text, Paragraph } = Typography;

const CheckInInfo = ({ dataDetail }) => {
    const { id } = useParams();
    const {data: dataCheckInList, loading: loadingDataCheckInList} = useQuery(query_workWithPagination, {
        fetchPolicy: 'cache-and-network',
        variables: {
            where: {
                target: {
                    _eq: 'WAREHOUSE_BILL'
                },
                targetId: {
                    _eq: Number(id)
                },
                type: {
                    _eq: 'RECEIVE'
                }
            }
        }
    })
    const items: CollapseProps['items'] = dataCheckInList?.workWithPagination?.data?.map((checkin, index) => {
        return  {
            key: index,
            label: <Text>Mã check-in: <Text strong>{checkin?.code}</Text></Text>,
            children: <Flex vertical gap={10}>
                <Text>Thời gian check-in: <Text strong>{checkin?.checkInAt ? dayjs(checkin?.checkInAt).format('DD/MM/YYYY HH:mm') : "--"}</Text></Text>
                <Text>Thời gian hoàn thành phiên nhận: <Text strong>{checkin?.checkOutAt ? dayjs(checkin?.checkOutAt).format('DD/MM/YYYY HH:mm') : "--"}</Text></Text>
                <Text>Thời gian kết thúc lưu kho: <Text strong>--</Text></Text>
                <Divider dashed style={{margin: '10px 0', borderColor: '#999999'}}/>
            </Flex>,
        }
    })
    return (
        <Spin spinning={loadingDataCheckInList}>
            <Collapse defaultActiveKey={['1']} ghost items={items} />
        </Spin>
    );
};

export default CheckInInfo;
