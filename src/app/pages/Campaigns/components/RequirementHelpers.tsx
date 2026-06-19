import React from "react";
import { Form, Select } from "antd";
import { IEditCampaignForm } from "app/pages/Campaigns/types";
import { FormItemProps, Rule } from "antd/es/form";

type CanProps = {
  has: boolean;
  children: React.ReactNode;
};

export const Can = ({ has, children }: CanProps) => {
  if (!has) return null;
  return <>{children}</>;
};

type RangeMultiSelectOption = {
  label: string;
  value: number[];
};

export interface RangeMultiSelectProps extends FormItemProps {
  name: any;
  options: RangeMultiSelectOption[];
  placeholder?: string;
}
export const RangeMultiSelect = ({
  name,
  options,
  placeholder,
  ...props
}: RangeMultiSelectProps) => {
  return (
    <Form.Item<IEditCampaignForm>
      name={name}
      {...props}
      style={{ marginBottom: 0 }}
      getValueProps={(value: number[][] = []) => ({
        value: value.map((range) => range.join("-")),
      })}
      normalize={(value: string[]) =>
        value.map((range) => range.split("-").map(Number))
      }
    >
      <Select
        mode="multiple"
        placeholder={placeholder}
        options={options.map((opt) => ({
          label: opt.label,
          value: opt.value.join("-"),
        }))}
        style={{
          width: "fit-content",
          minWidth: 200,
          maxWidth: "100%",
        }}
      />
    </Form.Item>
  );
};
