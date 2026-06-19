import { Col, DatePicker, Flex, Form, Input, Row, Select, Typography } from "antd";
import { editCampaignRules } from "app/pages/Campaigns/ListCampainEdit/validation";
import { ChannelLogo } from "app/pages/Campaigns/components";
import { IEditCampaignForm } from "app/pages/Campaigns/types/EditCampaign.type";
import React, { useMemo } from "react";
import useCampaignStoreChannelOptions from "../../ListCampaign/hooks/useCampaignStoreChannelOptions";

const { Text } = Typography;

const SectionGeneralInfo = () => {
  const { optionsChannel } = useCampaignStoreChannelOptions();

  const form = Form.useFormInstance<IEditCampaignForm>();
  const refCampaignId = Form.useWatch("refCampaignId", form);

  const renderLabelChannel = (item: any) => {
    const channel = optionsChannel?.find((op: any) => op?.value == item?.value);
    return (
      <Flex gap={4} align="center">
        <ChannelLogo code={channel?.value || item?.value} />
        <Text>{channel?.label}</Text>
      </Flex>
    );
  };

  return (
    <>
      <Form.Item<IEditCampaignForm> name="refCampaignId" hidden>
      </Form.Item>
      <Row gutter={24}>
        <Col span={24}>
          <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
            <Text>Tên chiến dịch</Text>
            <Text type="secondary">ID: {refCampaignId ?? '--'}</Text>
          </Flex>
          <Form.Item<IEditCampaignForm>
            name="name"
            validateFirst
          >
            <Input disabled placeholder="Tên chiến dịch"/>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item<IEditCampaignForm>
            label="Sàn"
            name="connectorChannelCode"
            validateFirst
          >
            <Select
              disabled
              placeholder="Sàn"
              style={{ width: "100%" }}
              labelRender={(item) => renderLabelChannel(item)}
              options={optionsChannel}
            />
          </Form.Item>


          <Form.Item<IEditCampaignForm>
            label="Thời gian diễn ra"
            name="eventTime"
          >
            <DatePicker.RangePicker
              disabled
              style={{ width: "100%" }}
              placeholder={["DD/MM/YYYY", "DD/MM/YYYY"]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item<IEditCampaignForm>
            label="Thời gian đăng ký"
            name="registrationTime"
          >
            <DatePicker.RangePicker
              disabled
              style={{ width: "100%" }}
              placeholder={["DD/MM/YYYY", "DD/MM/YYYY"]}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item<IEditCampaignForm>
            label="Mô tả chiến dịch"
            name="description"
          >
            <Input disabled placeholder="Mô tả chiến dịch" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default SectionGeneralInfo;
