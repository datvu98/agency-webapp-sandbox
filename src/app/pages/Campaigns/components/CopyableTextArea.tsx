import React, { useRef } from "react";
import { Input, message, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import type { TextAreaProps } from "antd/es/input";

interface CopyableTextAreaProps extends TextAreaProps {}

export const CopyableTextArea = ({
  placeholder,
  style,
  ...restProps
}: CopyableTextAreaProps) => {
  const textAreaRef = useRef<any>(null);

  const handleCopy = async () => {
    const value = textAreaRef.current?.resizableTextArea?.textArea?.value;
    if (!value) {
      message.warning("Không có nội dung để copy");
      return;
    }

    await navigator.clipboard.writeText(value);
    message.success("Đã copy nội dung");
  };

  return (
    <div style={{ position: "relative" }}>
      <Input.TextArea
        ref={textAreaRef}
        placeholder={placeholder}
        style={{ paddingRight: 40, ...style }}
        {...restProps}
      />

      <Tooltip title="Copy">
        <CopyOutlined
          onClick={handleCopy}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            cursor: "pointer",
            color: "#8c8c8c",
            fontSize: 16,
          }}
        />
      </Tooltip>
    </div>
  );
};
