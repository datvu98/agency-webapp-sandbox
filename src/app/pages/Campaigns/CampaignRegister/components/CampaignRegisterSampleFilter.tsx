import { Col, DatePicker, Form, Input, Row, Select, Space, Tooltip } from "antd";
import { CampaignSampleFilterValues } from "app/pages/Campaigns/CampaignRegister/types";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import React, { useCallback } from "react";
import {
  ADVERTISING_TYPE_OPTIONS,
  TYPE_TIME_OPTIONS,
} from "../constants/constant";

const { Search } = Input;
const { RangePicker } = DatePicker;

type CampaignRegisterSampleFilterProps = {
  onFilterChange: (values: CampaignSampleFilterValues) => void;
  initialValues: CampaignSampleFilterValues;
};

const CampaignRegisterSampleFilter = ({
  onFilterChange,
  initialValues,
}: CampaignRegisterSampleFilterProps) => {
  const [form] = Form.useForm<CampaignSampleFilterValues>();

  const onSubmit = useCallback(() => {
    const formValues = form.getFieldsValue();
    onFilterChange(formValues);
  }, [form, onFilterChange]);

  const onRangeTimeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (!dates || (dates[0] && dates[1])) {
        onSubmit();
      }
    },
    [onSubmit],
  );

  return (
    <Form form={form} initialValues={initialValues} layout="vertical">
      <Row gutter={24}>
        <Col span={8}>
          <Tooltip title='Tìm một hoặc nhiều username cách nhau bởi dấu "," hoặc dấu cách'>
            <div>
              <Form.Item<CampaignSampleFilterValues> name="q" noStyle>
                <Search
                  placeholder="Tìm kiếm theo tên sản phẩm, tên và username của nhà sáng tạo"
                  onSearch={onSubmit}
                />
              </Form.Item>
            </div>
          </Tooltip>
        </Col>
        <Col span={8}>
          <Space.Compact block>
            <Form.Item<CampaignSampleFilterValues> name="key_time" noStyle>
              <Select
                options={TYPE_TIME_OPTIONS}
                style={{ width: 320 }}
                onChange={onSubmit}
              />
            </Form.Item>
            <Form.Item<CampaignSampleFilterValues> name="rangeTime" noStyle>
              <RangePicker
                placeholder={["DD/MM/YYYY", "DD/MM/YYYY"]}
                disabledDate={(current) => current && current > dayjs()}
                style={{ width: "100%" }}
                onChange={onRangeTimeChange}
              />
            </Form.Item>
          </Space.Compact>
        </Col>
        {/* <Col span={8}>
          <Form.Item<CampaignSampleFilterValues>
            name="advertisingTypes"
            noStyle
          >
            <Select
              placeholder="Hình thức quảng cáo"
              mode="multiple"
              options={ADVERTISING_TYPE_OPTIONS}
              style={{ width: "100%" }}
              onChange={onSubmit}
            />
          </Form.Item>
        </Col> */}
        <Col span={8}>
          <Form.Item<CampaignSampleFilterValues> name="registeredProductCountType" noStyle>
            <Select
              placeholder="Số lượng hàng hóa nhà sáng tạo đăng ký"
              allowClear
              style={{ width: "100%" }}
              onChange={onSubmit}
              options={[
                { label: "Một hàng hóa", value: "single" },
                { label: "Nhiều hàng hóa", value: "multiple" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export { CampaignRegisterSampleFilter };
