import {
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Tabs,
  Typography,
} from "antd";
import { SectionExpand, TextEditor } from "app/pages/Campaigns/components";
import CampaignImageUpload from "app/pages/Campaigns/components/CampaignImageUpload";
import { useUploadImage } from "app/pages/Campaigns/ListCampainEdit/hooks";
import {
  IEditCampaignForm,
  ICampaignStore,
} from "app/pages/Campaigns/types/EditCampaign.type";
import React from "react";
import {
  createHandleApplyToAllStores,
  useSyncStoreFields,
} from "../helpers/storeApplyHelpers";
import { campaignNameRule, storeRules } from "../validation";
import { showAlert } from "utils/helper";

const { Text } = Typography;

type SectionCampaignInfoPlatformProps = {
  basicInfoRef?: React.Ref<HTMLDivElement>;
  imageRef?: React.Ref<HTMLDivElement>;
  campaignInfoRef?: React.Ref<HTMLDivElement>;
  brandInfoRef?: React.Ref<HTMLDivElement>;
  guideRef?: React.Ref<HTMLDivElement>;
  stores?: ICampaignStore[];
  activeKey: string;
  activeStoreIndex: number;
  tabItems: { key: string; label: React.ReactNode }[];
  onChangeTab: (key: string) => void;
  isStoreLocked?: boolean;
};

const SectionCampaignInfoPlatform = ({
  basicInfoRef,
  stores = [],
  activeKey,
  activeStoreIndex,
  tabItems,
  onChangeTab,
  isStoreLocked = false,
}: SectionCampaignInfoPlatformProps) => {
  const form = Form.useFormInstance<IEditCampaignForm>();
  const { uploadImage } = useUploadImage();
  const handleApplyToAllStores = createHandleApplyToAllStores(form, activeStoreIndex);
  useSyncStoreFields(form, activeStoreIndex);

  return (
    <>
      {tabItems.length > 1 && <Tabs
        activeKey={activeKey}
        // onChange={(key) => {
        //   form.validateFields().catch((error) => {
        //     showAlert.error(error.message);
        //   }).then(() => {
        //     onChangeTab(key as string)
        //   })
        // }}
        onChange={onChangeTab}
        items={tabItems}
      />}

      <SectionExpand title="1. Thông tin cơ bản" wrapperRef={basicInfoRef}>
      <Form.Item<IEditCampaignForm>
        label={<Text>Tên chiến dịch theo từng cửa hàng <span className="form-item-required">*</span></Text>}
        name={["stores", activeStoreIndex, "campaignName"]}
        validateFirst
        rules={isStoreLocked ? [] : campaignNameRule()}
      >
        <Input
          placeholder="Nhập tên chiến dịch theo từng cửa hàng"
          disabled={isStoreLocked}
        />
      </Form.Item>

      <div>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 10 }}
        >
          <Col>
            <Text>Hình ảnh chiến dịch</Text>
          </Col>
          <Col>
            {tabItems.length > 1 && <Flex align="center" gap={4}>
              <Form.Item<IEditCampaignForm>
                name={["stores", activeStoreIndex, "applyBanner"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox
                  disabled={isStoreLocked}
                  onChange={handleApplyToAllStores("applyBanner", [
                    "bannerDesktopUrl",
                    "bannerMobileUrl",
                  ])}
                />
              </Form.Item>
              <Text style={{ fontSize: 10 }}>Áp dụng cho toàn bộ cửa hàng</Text>
            </Flex>}
          </Col>
        </Row>

        <Row gutter={24} style={{ marginBottom: 12 }}>
          <Col span={12}>
            <Text>Desktop</Text>
            <Form.Item<IEditCampaignForm>
              name={["stores", activeStoreIndex, "bannerDesktopUrl"]}
              validateFirst
              style={{ margin: 0, padding: 0 }}
              getValueFromEvent={(event) => event?.fileList?.[0]?.url || ""}
            >
              <CampaignImageUpload
                disabled={isStoreLocked}
                imageSizeText="Tối thiểu 600x600, tối đa 2000x2000 px"
                imageWidth={600}
                imageHeight={600}
                imageMaxWidth={2000}
                imageMaxHeight={2000}
              >
              </CampaignImageUpload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Text>Mobile <span className="form-item-required">*</span></Text>
            <Form.Item<IEditCampaignForm>
              name={["stores", activeStoreIndex, "bannerMobileUrl"]}
              validateFirst
              rules={
                isStoreLocked
                  ? []
                  : [
                    {
                      required: true,
                      message: "Vui lòng tải ảnh mobile",
                    },
                  ]
              }
              getValueFromEvent={(event) => event?.fileList?.[0]?.url || ""}
            >
              <CampaignImageUpload
                disabled={isStoreLocked}
                imageSizeText="Tối thiểu 398x398 px, tối đa 2000x2000 px"
                imageWidth={398}
                imageHeight={398}
                imageMaxWidth={2000}
                imageMaxHeight={2000}
              >
              </CampaignImageUpload>
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 8, marginTop: 12 }}
        >
          <Col>
            <Text>Thông tin chiến dịch <span className="form-item-required">*</span></Text>
          </Col>
          <Col>
            {tabItems.length > 1 && <Flex align="center" gap={4}>
              <Form.Item<IEditCampaignForm>
                name={["stores", activeStoreIndex, "applyDescription"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox
                  disabled={isStoreLocked}
                  onChange={handleApplyToAllStores("applyDescription", [
                    "description",
                  ])}
                />  
              </Form.Item>
              <Text style={{ fontSize: 10 }}>Áp dụng cho toàn bộ cửa hàng</Text>
            </Flex>}
          </Col>
        </Row>
        <Form.Item<IEditCampaignForm>
          name={["stores", activeStoreIndex, "description"]}
          validateFirst
          rules={storeRules.description?.(!isStoreLocked)}
        >
          <TextEditor
            placeholder="Nhập thông tin chiến dịch"
            onUploadImage={uploadImage}
            copyable
            readOnly={isStoreLocked}
          />
        </Form.Item>
      </div>

      <div>
        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
          <Col>
            <Text>Thông tin nhãn hàng <span className="form-item-required">*</span></Text>
          </Col>
          <Col>
            {tabItems.length > 1 && <Flex align="center" gap={4}>
              <Form.Item<IEditCampaignForm>
                name={["stores", activeStoreIndex, "applyBrandInfo"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox
                  disabled={isStoreLocked}
                  onChange={handleApplyToAllStores("applyBrandInfo", [
                    "brandInfo",
                  ])}
                />
              </Form.Item>
              <Text style={{ fontSize: 10 }}>Áp dụng cho toàn bộ cửa hàng</Text>
            </Flex>}
          </Col>
        </Row>
        <Form.Item<IEditCampaignForm>
          name={["stores", activeStoreIndex, "brandInfo"]}
          validateFirst
          rules={storeRules.brandInfo?.(!isStoreLocked)}
        >
          <TextEditor
            placeholder="Nhập thông tin nhãn hàng"
            onUploadImage={uploadImage}
            copyable
            readOnly={isStoreLocked}
          />
        </Form.Item>
      </div>
      {/* <div>
        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
          <Col>
            <Text>Hướng dẫn chiến dịch <span className="form-item-required">*</span></Text>
          </Col>
          <Col>
            {tabItems.length > 1 && <Flex align="center" gap={4}>
              <Form.Item<IEditCampaignForm>
                name={["stores", activeStoreIndex, "applyInstruction"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox
                  disabled={isStoreLocked}
                  onChange={handleApplyToAllStores("applyInstruction", [
                    "instruction",
                  ])}
                />
              </Form.Item>
              <Text style={{ fontSize: 10 }}>Áp dụng cho toàn bộ cửa hàng</Text>
            </Flex>}
          </Col>
        </Row>
        <Form.Item<IEditCampaignForm>
          name={["stores", activeStoreIndex, "instruction"]}
          validateFirst
          // rules={storeRules.instruction?.(!isStoreLocked)}
        >
          <TextEditor
            placeholder="Nhập hướng dẫn chiến dịch"
            onUploadImage={uploadImage}
            copyable
            readOnly={isStoreLocked}
          />
        </Form.Item>
      </div> */}
      </SectionExpand>
    </>
  );
};

export default SectionCampaignInfoPlatform;
