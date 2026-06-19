import { InboxOutlined } from "@ant-design/icons";

import type { UploadProps } from "antd";

import {
  Button,
  Col,
  Flex,
  Image,
  Modal,
  Row,
  Spin,
  Typography,
  Upload,
} from "antd";
import React from "react";
import productImportSampleUrl from "assets/aff/product_import_format.xlsx";
import guideQuickFileImage from "assets/aff/get-file-product.png";
const { Text } = Typography;

interface ModalGuideProps {
  show: boolean;
  onHide: () => void;
  modalGuideUploadProps: UploadProps;
  canConfirm: boolean;
  onConfirm: () => void | Promise<void>;
  confirmLoading: boolean;
  uploadLoading?: boolean;
  fileName?: string;
}

const ModalGuide = ({
  show,
  onHide,
  modalGuideUploadProps,
  canConfirm,
  onConfirm,
  confirmLoading,
  uploadLoading = false,
  fileName,
}: ModalGuideProps) => {
  return (
    <Modal
      open={show}
      onCancel={onHide}
      onOk={onConfirm}
      confirmLoading={confirmLoading}
      width={960}
      title="Tải sản phẩm trong chiến dịch"
      destroyOnClose
      centered
      cancelButtonProps={{ style: { display: "none" } }}
      okText="Đồng ý"
      okButtonProps={{ disabled: !canConfirm }}
    >
      <Flex vertical gap={20} style={{ margin: "24px 0" }}>
        <Row gutter={[16, 0]} align="middle">
          <Col xs={24} sm={6}>
            <Text>Tải excel mẫu</Text>
          </Col>

          <Col xs={24} sm={18}>
            <Button
              type="primary"
              href={productImportSampleUrl}
              download="File mẫu.xlsx"
            >
              Tải file mẫu tại đây
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 0]} align="top">
          <Col xs={24} sm={6}>
            <Text>
              Tải lên tập tin<Text type="danger">*</Text>
            </Text>
          </Col>

          <Col xs={24} sm={18}>
            <Spin spinning={uploadLoading}>
              <Upload.Dragger
                name="file"
                multiple={false}
                {...modalGuideUploadProps}
                style={{
                  minHeight: 150,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: "#1677ff" }} />
                </p>
                {fileName ? (
                  <>
                    <p className="ant-upload-text" style={{ fontWeight: 600 }}>
                      {fileName}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="ant-upload-text" style={{ fontWeight: 600 }}>
                      Chọn hoặc kéo thả file excel để tải lên
                    </p>
                    <p
                      className="ant-upload-hint"
                      style={{ color: "rgba(0,0,0,0.45)" }}
                    >
                      File dưới 10MB, định dạng xls
                    </p>
                  </>
                )}
              </Upload.Dragger>
            </Spin>

            <Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginTop: 8 }}
            >
              File nhập có dung lượng tối đa 10MB
            </Text>
          </Col>
        </Row>

        <Row gutter={[16, 0]} align="top">
          <Col xs={24} sm={6}>
            <Text>Hướng dẫn tải file nhanh</Text>
          </Col>

          <Col xs={24} sm={18}>
            <Image
              src={guideQuickFileImage}
              alt="Quick guide for downloading product file"
              width={250}
              height={250}
              style={{ borderRadius: 8, objectFit: "cover" }}
              preview={{
                mask: "Xem chi tiết",
              }}
            />
          </Col>
        </Row>
      </Flex>
    </Modal>
  );
};

export default ModalGuide;
