import { InfoCircleOutlined } from "@ant-design/icons";
import { Flex, Skeleton, Tooltip, Typography } from "antd";
import React from "react";
import { useParams } from "react-router-dom";
import { useGetReportCampaignSample, useSampleFilter } from "../hooks";
import { NA } from "../constants/constant";

const { Text } = Typography;

const CampaignSampleReport = () => {
  const { id } = useParams<{ id: string }>();
  const campaignStoreId = id ? Number(id) : undefined;
  const { apiPayload } = useSampleFilter();

  const filter = {
    campaignStoreId,
    ...apiPayload,
  };

  const { data, loading } = useGetReportCampaignSample({ filter });

  const postStatisticItems = [
    {
      label: "Tổng số bài đăng dự kiến:",
      tooltip:
        "Ước tính tổng số lượng video và livestream Nhà sáng tạo sẽ thực hiện (bao gồm các yêu cầu đang chờ phê duyệt và đã được chấp thuận)",
      value: data?.totalExpectedPosts,
    },
    {
      label: "Tổng số bài đăng cam kết:",
      tooltip:
        "Tổng số lượng số lượng video và livestream Nhà sáng tạo có nghĩa vụ hoàn thành, được tính toán dựa trên số lượng sản phẩm thực tế đã được phê duyệt.",
      value: data?.totalCommittedPosts,
    },
    {
      label: "Tổng số bài đăng hoàn thành:",
      tooltip:
        "Tổng số lượng video và livestream thực tế Nhà sáng tạo đã hoàn thành và được xác nhận nghiệm thu",
      value: data?.totalCompletedPosts,
    },
  ];

  return (
    <Flex
      align="center"
      justify="flex-start"
      gap={12}
      style={{ marginBottom: 20 }}
    >
      {postStatisticItems.map((item, index) => (
        <Flex key={index} align="center" justify="center" gap={4}>
          <Text style={{ flexShrink: 1, whiteSpace: "nowrap" }}>
            {item.label}
          </Text>
          <Tooltip title={item.tooltip}>
            <InfoCircleOutlined />
          </Tooltip>
          {loading ? (
            <Skeleton.Input
              size="small"
              block
              active
              style={{ minWidth: 30, width: 30 }}
            />
          ) : (
            <Text strong style={{ fontWeight: 600 }}>
              {item.value ?? NA}
            </Text>
          )}
        </Flex>
      ))}
    </Flex>
  );
};

export { CampaignSampleReport };
