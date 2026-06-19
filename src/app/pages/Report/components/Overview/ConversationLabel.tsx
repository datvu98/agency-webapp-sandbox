import { Card, Empty, Flex, Typography } from "antd";
import React, { Fragment, ReactNode, memo } from "react";
import { LABELS_TOP } from "../../ReportConstants";
import { Rank1Icon, Rank2Icon, Rank3Icon, Rank4Icon, Rank5Icon } from "../../components/Ranks";
import { useReportContext } from "app/contexts/ReportContext";
import { useQuery } from "@apollo/client";
import query_chatReportOverviewTopLabels from "graphql/queries/query_chatReportOverviewTopLabels";
import { generateDateDefault } from '../../ReportHelper';
import classNames from "classnames";

const { Text } = Typography;

const RankIcons: Record<number, ReactNode> = {
    1: <Rank1Icon />,
    2: <Rank2Icon />,
    3: <Rank3Icon />,
    4: <Rank4Icon />,
    5: <Rank5Icon />,
};

const ConversationLabel = () => {
    const { variablesQuery } = useReportContext();

    const { loading, data } = useQuery(query_chatReportOverviewTopLabels, {
        variables: {
            ...generateDateDefault(),
            ...variablesQuery
        },
        fetchPolicy: 'cache-and-network',
    });

    return (
        <Card
            className={classNames(!loading && "card-top-label")}
            loading={loading}
        >
            <Flex align="center" vertical gap={20}>
                <Flex gap={8}>
                    <Text className="title-card" strong>Top 5 nhãn hội thoại được gán nhiều nhất</Text>
                </Flex>
                <Flex className="w-100" vertical gap={10}>
                    {data?.chatReportOverviewTopLabels?.length > 0 ? (
                        <Fragment>
                            {data?.chatReportOverviewTopLabels?.map((item, index: number) => {
                                return (
                                    <Flex justify="space-between" align="center">
                                        <Flex align="center" gap={10}>
                                            {RankIcons[index + 1]}
                                            <Text strong>{item?.title}</Text>
                                        </Flex>
                                        <Text>
                                            {item?.countAttachment}
                                        </Text>
                                    </Flex>
                                )
                            })}
                        </Fragment>
                    ) : (
                        <Empty
                            className="empty-section"
                            description="Chưa có dữ liệu"
                        />
                    )}
                </Flex>
            </Flex>
        </Card>
    )
}

export default memo(ConversationLabel);