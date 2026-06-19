import React, { useEffect, useMemo } from "react";
import { Checkbox, Flex, Form, InputNumber, Typography } from "antd";
import { NamePath } from "antd/es/form/interface";
import { IConditionItem, IEditCampaignForm } from "app/pages/Campaigns/types";
import {
  createValidateMaxRange,
  createValidateMinRange,
  formatCurrency,
  formatRangeDisplay,
  parseCurrency,
  syncMetricRange,
} from "../helpers/metricRangeFilter.utils";

const { Text } = Typography;

type MetricRangeFilterProps = {
  metricLabel: string;
  unit: string;
  enabled: boolean;
  nameMatrix: NamePath;
  nameMin: NamePath;
  nameMax: NamePath;
  nameNoLimit: NamePath;
  minPlaceholder?: string;
  maxPlaceholder?: string;
};

const MetricRangeFilter = ({
  metricLabel,
  unit,
  enabled,
  nameMatrix,
  nameMin,
  nameMax,
  nameNoLimit,
  minPlaceholder = "Nhập tối thiểu",
  maxPlaceholder = "Nhập tối đa",
}: MetricRangeFilterProps) => {
  const form = Form.useFormInstance<IEditCampaignForm>();

  const minValue = Form.useWatch(nameMin, form) as number | null | undefined;
  const maxValue = Form.useWatch(nameMax, form) as number | null | undefined;
  const noLimitValue = Boolean(Form.useWatch(nameNoLimit, form));

  const validateMinRange = useMemo(
    () => createValidateMinRange(form, nameNoLimit, nameMax),
    [form, nameNoLimit, nameMax],
  );
  const validateMaxRange = useMemo(
    () => createValidateMaxRange(form, nameMin, nameNoLimit),
    [form, nameMin, nameNoLimit],
  );

  useEffect(() => {
    syncMetricRange({
      form,
      nameMatrix,
      nameMin,
      nameMax,
      nameNoLimit,
      enabled,
      minValue,
      maxValue,
      noLimitValue,
    });
  }, [enabled, minValue, maxValue, noLimitValue]);

  const descriptionText = noLimitValue
    ? `Hơn ${formatRangeDisplay(minValue)} (${unit})`
    : Number(minValue) === 0
      ? `${metricLabel} dưới ${formatRangeDisplay(maxValue)} (${unit})`
      : `${metricLabel} trong khoảng ${formatRangeDisplay(minValue)} đến ${formatRangeDisplay(maxValue)} (${unit})`;

  return (
    <div style={{ width: "100%", maxWidth: 720 }}>
      <Flex vertical gap={10}>
        <Form.Item<IEditCampaignForm>
          name={nameNoLimit}
          valuePropName="checked"
          style={{ marginBottom: 0 }}
          noStyle
        >
          <Checkbox disabled={Number.isInteger(minValue) && Number(minValue) === 0}>
            Không giới hạn
          </Checkbox>
        </Form.Item>

        <Flex align="start" gap={12} wrap="wrap">
          <Form.Item<IEditCampaignForm>
            name={nameMin}
            // dependencies={[nameMax, nameNoLimit]}
            style={{ marginBottom: 0, width: "200px" }}
            rules={[{ validator: validateMinRange }]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <InputNumber
              min={0}
              step={1}
              placeholder={minPlaceholder}
              style={{ width: "200px" }}
              formatter={formatCurrency}
              parser={parseCurrency}
              controls={false}
            />
          </Form.Item>
          <Form.Item<IEditCampaignForm>
            name={nameMax}
            // dependencies={[nameMin, nameNoLimit]}
            style={{ marginBottom: 0, width: "200px" }}
            rules={[{ validator: validateMaxRange }]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <InputNumber
              min={0}
              step={1}
              placeholder={maxPlaceholder}
              style={{ width: "200px" }}
              formatter={formatCurrency}
              parser={parseCurrency}
              controls={false}
              disabled={noLimitValue}
            />
          </Form.Item>
        </Flex>

        <Text type="secondary">{descriptionText}</Text>
      </Flex>
    </div>
  );
};

export default MetricRangeFilter;
