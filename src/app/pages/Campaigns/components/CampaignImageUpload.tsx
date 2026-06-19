import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Modal, Space, Typography, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUploadImage } from "app/pages/Campaigns/ListCampainEdit/hooks";
import { showAlert } from "utils/helper";

const { Text } = Typography;

type CampaignImageUploadProps = React.ComponentProps<typeof Upload.Dragger> & {
  imageSizeText?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageMaxWidth?: number;
  imageMaxHeight?: number;
  value?: string;
};

// Spec: 5MB max
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT_TYPES = ["image/jpeg", "image/png"];

const CampaignImageUpload = ({
  imageSizeText,
  imageWidth,
  imageHeight,
  imageMaxWidth,
  imageMaxHeight,
  value,
  style,
  onChange,
  beforeUpload,
  disabled,
  ...props
}: CampaignImageUploadProps) => {
  const isDisabled = Boolean(disabled);
  const { uploadImage } = useUploadImage();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [hovered, setHovered] = useState(false);

  const uploadContainerRef = React.useRef<HTMLDivElement | null>(null);

  /* ================= VALIDATION ================= */

  const validateFile = async (file: File) => {
    if (!ACCEPT_TYPES.includes(file.type)) {
      showAlert.error("Bạn chỉ có thể tải lên file JPG/PNG");
      return false;
    }

    if (file.size > MAX_SIZE) {
      showAlert.error("Dung lượng file tối đa 5MB");
      return false;
    }

    // validate kích thước ảnh nếu có truyền vào (>= min và <= max)
    if (imageWidth || imageHeight || imageMaxWidth || imageMaxHeight) {
      const minW = imageWidth;
      const minH = imageHeight;
      const maxW = imageMaxWidth;
      const maxH = imageMaxHeight;

      const isValidDimension = await new Promise<boolean>((resolve) => {
        const img = new Image();

        const url = URL.createObjectURL(file);
        img.src = url
        img.onload = () => {
          URL.revokeObjectURL(url);
          const valid =
            (minW == null || img.width >= minW) &&
            (minH == null || img.height >= minH) &&
            (maxW == null || img.width <= maxW) &&
            (maxH == null || img.height <= maxH);

          if (!valid) {
            const minTextW = minW ?? "?";
            const minTextH = minH ?? "?";
            const maxTextW = maxW ?? "?";
            const maxTextH = maxH ?? "?";

            // Hiển thị kiểu: "tối thiểu A x B, tối đa C x D"
            const sizeText =
              maxW != null || maxH != null
                ? `tối thiểu ${minTextW} x ${minTextH}, tối đa ${maxTextW} x ${maxTextH}`
                : `tối thiểu ${minTextW} x ${minTextH}`;

            showAlert.error(`Ảnh phải có kích thước ${sizeText} px`);
          }

          resolve(valid);
        };
        img.src = URL.createObjectURL(file);
      });

      if (!isValidDimension) return false;
    }

    return true;
  };

  /* ================= HANDLE CHANGE ================= */

  const handleChange: UploadProps["onChange"] = useCallback(
    (info) => {
      if (isDisabled) return;
      const latestFileList = info.fileList.slice(-1);
      setFileList(latestFileList);
      onChange?.({ ...info, fileList: latestFileList });
    },
    [isDisabled, onChange]
  );

  /* ================= HANDLE UPLOAD ================= */

  const uploadFile = useCallback(
    async (file: File) => {
      if (isDisabled) return;
      try {
        setUploading(true);
        const uploadedUrl = await uploadImage(file);
        const uploadedFile: UploadFile = {
          uid: `${Date.now()}`,
          name: file.name,
          status: "done",
          url: uploadedUrl,
        };

        setFileList([uploadedFile]);
        onChange?.({
          file: uploadedFile,
          fileList: [uploadedFile],
        });
      } catch {
        // Error message is handled in useUploadImage.
      } finally {
        setUploading(false);
      }
    },
    [isDisabled, onChange, uploadImage]
  );

  const handleBeforeUpload: UploadProps["beforeUpload"] = useCallback(
    async (file, files) => {
      if (isDisabled) return Upload.LIST_IGNORE;
      const valid = await validateFile(file as File);
      if (!valid) return Upload.LIST_IGNORE;

      beforeUpload?.(file, files);
      uploadFile(file as File);
      return false;
    },
    [beforeUpload, isDisabled, uploadFile]
  );

  /* ================= ACTIONS ================= */

  const handleRemoveImage = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (isDisabled) return;
      setFileList([]);
      onChange?.({
        file: { uid: `${Date.now()}`, name: "", status: "removed" },
        fileList: [],
      });
    },
    [isDisabled, onChange]
  );

  const handleReplaceImage = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (isDisabled) return;
      const fileInput = uploadContainerRef.current?.querySelector(
        "input[type='file']"
      ) as HTMLInputElement | null;
      fileInput?.click();
    },
    [isDisabled]
  );

  /* ================= IMAGE PREVIEW ================= */

  const imageUrl = useMemo(() => {
    const file = fileList?.[0];
    if (!file) return "";
    return file.url || file.thumbUrl || "";
  }, [fileList]);

  useEffect(() => {
    if (!value) {
      setFileList([]);
      return;
    }

    setFileList((prev) => {
      const currentUrl = prev?.[0]?.url || prev?.[0]?.thumbUrl;
      if (currentUrl === value) return prev;
      return [
        {
          uid: `${Date.now()}`,
          name: "image",
          status: "done",
          url: value,
        },
      ];
    });
  }, [value]);

  /* ================= RENDER ================= */

  return (
    <>
      <div ref={uploadContainerRef} style={{ height: "240px" }}>
        <Upload.Dragger
          {...props}
          disabled={isDisabled}
          style={{ marginTop: 8, height: "240px", ...style }}
          maxCount={1}
          accept="image/png, image/jpeg"
          showUploadList={false}
          fileList={fileList}
          beforeUpload={handleBeforeUpload}
          onChange={handleChange}
          openFileDialogOnClick={!imageUrl && !isDisabled}
        >
          {imageUrl ? (
            <div
              style={{ position: "relative", height: "240px" }}
              onMouseEnter={() => !isDisabled && setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <img
                src={imageUrl}
                alt="preview"
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "contain",
                  padding: 4,
                }}
              />

              {hovered && !isDisabled && (
                <Space
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 12,
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: 8,
                    padding: "4px 6px",
                  }}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined style={{ color: "#fff" }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPreview(true);
                    }}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined style={{ color: "#fff" }} />}
                    onClick={handleReplaceImage}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined style={{ color: "#fff" }} />}
                    onClick={handleRemoveImage}
                  />
                </Space>
              )}
            </div>
          ) : (
            <div style={{ padding: 24 }}>
              <UploadOutlined style={{ fontSize: 24, color: "#999" }} />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {uploading ? "Đang tải ảnh..." : imageSizeText}
                </Text>
              </div>
            </div>
          )}
        </Upload.Dragger>
      </div>

      <Modal
        open={openPreview}
        footer={null}
        onCancel={() => setOpenPreview(false)}
        centered
      >
        <img
          src={imageUrl}
          alt="preview-large"
          style={{ width: "100%" }}
        />
      </Modal>
    </>
  );
};

export default CampaignImageUpload;