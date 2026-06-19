import {
  Checkbox,
  Col,
  Flex,
  Form,
  InputNumber,
  Radio,
  Row,
  Select,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { NamePath } from "antd/es/form/interface";
import {
  Can,
  RangeMultiSelect,
  SectionExpand,
  TextEditor,
} from "app/pages/Campaigns/components";
import {
  FOLLOWER_AGE_OPTIONS,
  FOLLOWER_GENDER_OPTIONS,
  JOIN_TYPE_OPTIONS,
  PERFORMANCE_ENGAGEMENT_OPTIONS,
} from "app/pages/Campaigns/ListCampainEdit/constants";
import {
  useUploadImage,
  useWatchConditions,
} from "app/pages/Campaigns/ListCampainEdit/hooks";
import {
  advertisingFormatRule,
  conditionRules,
  postDemoGreaterThanVideoDemoRule,
} from "app/pages/Campaigns/ListCampainEdit/validation";
import { IConditionItem, IEditCampaignForm } from "app/pages/Campaigns/types";
import React, { useEffect } from "react";
import MetricRangeFilter from "../components/MetricRangeFilter";

const { Text } = Typography;

type SectionRequirementProps = {
  activeStoreIndex: number;
  isStoreLocked?: boolean;
};

const SectionRequirement = ({
  activeStoreIndex,
  isStoreLocked = false,
}: SectionRequirementProps) => {
  const form = Form.useFormInstance<IEditCampaignForm>();
  const { uploadImage } = useUploadImage();

  const {
    followers_enabled,
    range_age_enabled,
    gender_enabled,
    gmv_enabled,
    sold_enabled,
    avg_video_views_enabled,
    avg_live_views_enabled,
    engagement_rate_enabled,
    video_enabled,
    livestream_enabled,
  } = useWatchConditions(form, activeStoreIndex);

  const getFieldName = <T extends keyof IConditionItem>(name: T): NamePath => {
    return ["stores", activeStoreIndex, "conditions", 0, name];
  };
  const getStoreFieldName = (name: "has_demo_approval"): NamePath => {
    return ["stores", activeStoreIndex, name];
  };

  const has_demo_approval = Form.useWatch(
    getStoreFieldName("has_demo_approval"),
    form,
  );
  const requiresDemoApproval =
    has_demo_approval === undefined ||
    has_demo_approval === 1 ||
    has_demo_approval === true;

  useEffect(() => {
    if (livestream_enabled) {
      const currentVal = form.getFieldValue(getFieldName("live_session_count"));
      const n = Number(currentVal);
      if (currentVal == null || currentVal === "" || Number.isNaN(n) || n < 1) {
        form.setFieldValue(getFieldName("live_session_count"), 1);
      }
    }
    if (video_enabled) {
      const currentVal = form.getFieldValue(getFieldName("video_count"));
      const n = Number(currentVal);
      if (currentVal == null || currentVal === "" || Number.isNaN(n) || n < 1) {
        form.setFieldValue(getFieldName("video_count"), 1);
      }

      if (requiresDemoApproval) {
        const currentVideoDemoDeadline = form.getFieldValue(
          getFieldName("video_demo_deadline"),
        );
        const videoDemoDeadlineNum = Number(currentVideoDemoDeadline);
        if (
          currentVideoDemoDeadline == null ||
          currentVideoDemoDeadline === "" ||
          Number.isNaN(videoDemoDeadlineNum) ||
          videoDemoDeadlineNum < 1
        ) {
          form.setFieldValue(getFieldName("video_demo_deadline"), 5);
        }
      }

      const currentPostDemoDeadline = form.getFieldValue(
        getFieldName("post_demo_deadline"),
      );
      const postDemoDeadlineNum = Number(currentPostDemoDeadline);
      if (
        currentPostDemoDeadline == null ||
        currentPostDemoDeadline === "" ||
        Number.isNaN(postDemoDeadlineNum) ||
        postDemoDeadlineNum < 1
      ) {
        form.setFieldValue(getFieldName("post_demo_deadline"), 10);
      }
    } else if (livestream_enabled) {
      const currentPostDemoDeadline = form.getFieldValue(
        getFieldName("post_demo_deadline"),
      );
      const postDemoDeadlineNum = Number(currentPostDemoDeadline);
      if (
        currentPostDemoDeadline == null ||
        currentPostDemoDeadline === "" ||
        Number.isNaN(postDemoDeadlineNum) ||
        postDemoDeadlineNum < 1
      ) {
        form.setFieldValue(getFieldName("post_demo_deadline"), 10);
      }
    }
  }, [
    livestream_enabled,
    video_enabled,
    requiresDemoApproval,
    activeStoreIndex,
    form,
  ]);

  return (
    <SectionExpand title="3. Yêu cầu">
      <div
        style={{
          opacity: isStoreLocked ? 0.7 : 1,
          pointerEvents: isStoreLocked ? "none" : "auto",
        }}
      >
        <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
          <Typography.Text>Nhà sáng tạo tham gia</Typography.Text>

          <Form.Item<IEditCampaignForm>
            name={getFieldName("join_type")}
            initialValue={JOIN_TYPE_OPTIONS[0]?.value}
            noStyle
          >
            <Radio.Group disabled={isStoreLocked}>
              {JOIN_TYPE_OPTIONS.map((opt) => {
                const optionDisabled = Boolean(opt.disabled);
                const shouldShowTooltip =
                  optionDisabled && Boolean(opt.tooltipTitle);

                const radioNode = (
                  <Radio
                    key={opt.value}
                    value={opt.value}
                    disabled={isStoreLocked || optionDisabled}
                  >
                    {opt.label}
                  </Radio>
                );

                if (!shouldShowTooltip) return radioNode;

                return (
                  <Tooltip
                    key={opt.value}
                    title={opt.tooltipTitle}
                    placement={(opt.tooltipPlacement ?? "top") as any}
                  >
                    {/* Wrapper để Tooltip vẫn bắt được hover khi Radio bị disabled */}
                    <span style={{ display: "inline-block" }}>{radioNode}</span>
                  </Tooltip>
                );
              })}
            </Radio.Group>
          </Form.Item>
        </Flex>

        <Form.Item<IEditCampaignForm>>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              opacity: isStoreLocked ? 0.7 : 1,
              pointerEvents: isStoreLocked ? "none" : "auto",
            }}
          >
            <Flex align="flex-start" gap={20}>
              <Form.Item<IEditCampaignForm>
                name={getFieldName("followers_enabled")}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>Số lượng người theo dõi</Checkbox>
              </Form.Item>

              <Can has={followers_enabled}>
                <MetricRangeFilter
                  metricLabel="Số lượng người theo dõi"
                  unit="người"
                  enabled={followers_enabled}
                  nameMatrix={getFieldName("followers")}
                  nameMin={getFieldName("followers_min")}
                  nameMax={getFieldName("followers_max")}
                  nameNoLimit={getFieldName("followers_no_limit")}
                  minPlaceholder="Nhập số người tối thiểu"
                  maxPlaceholder="Nhập số người tối đa"
                />
              </Can>
            </Flex>

            <Flex align="center" gap={12}>
              <Form.Item<IEditCampaignForm>
                name={getFieldName("range_age_enabled")}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>Độ tuổi người theo dõi</Checkbox>
              </Form.Item>

              <Can has={range_age_enabled}>
                <RangeMultiSelect
                  dependencies={[[getFieldName("range_age_enabled")]]}
                  rules={conditionRules.range_age?.(
                    range_age_enabled && !isStoreLocked,
                  )}
                  name={getFieldName("range_age")}
                  options={FOLLOWER_AGE_OPTIONS}
                  placeholder="Chọn độ tuổi"
                />
              </Can>
            </Flex>

            <Flex align="center" gap={12}>
              <Form.Item<IEditCampaignForm>
                name={getFieldName("gender_enabled")}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>Giới tính người theo dõi</Checkbox>
              </Form.Item>

              <Can has={gender_enabled}>
                <Form.Item<IEditCampaignForm>
                  name={getFieldName("gender")}
                  dependencies={[[getFieldName("gender_enabled")]]}
                  rules={conditionRules?.gender?.(
                    gender_enabled && !isStoreLocked,
                  )}
                  noStyle
                >
                  <Select
                    placeholder="Chọn giới tính"
                    options={FOLLOWER_GENDER_OPTIONS}
                    style={{
                      width: "fit-content",
                      minWidth: 200,
                      maxWidth: "100%",
                    }}
                  />
                </Form.Item>
              </Can>
            </Flex>

            <Flex align="flex-start" gap={20}>
              <Flex align="center">
                <Form.Item<IEditCampaignForm>
                  name={getFieldName("gmv_enabled")}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>GMV</Checkbox>
                </Form.Item>
                <Tooltip title="Doanh thu do nhà sáng tạo tạo ra thông qua chương trình tiếp thị liên kết trong 30 ngày qua.">
                  <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                </Tooltip>
              </Flex>
              <Can has={gmv_enabled}>
                <MetricRangeFilter
                  metricLabel="GMV"
                  unit="VNĐ"
                  enabled={gmv_enabled}
                  nameMatrix={getFieldName("gmv")}
                  nameMin={getFieldName("gmv_min")}
                  nameMax={getFieldName("gmv_max")}
                  nameNoLimit={getFieldName("gmv_no_limit")}
                  minPlaceholder="Nhập GMV tối thiểu"
                  maxPlaceholder="Nhập GMV tối đa"
                />
              </Can>
            </Flex>

            <Flex align="flex-start" gap={20}>
              <Flex align="center">
                <Form.Item<IEditCampaignForm>
                  name={getFieldName("sold_enabled")}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>Số món bán ra</Checkbox>
                </Form.Item>
                <Tooltip title="Số món do nhà sáng tạo bán ra từ LIVE, video link bán hàng hoặc trang trưng bày trong 30 ngày qua.">
                  <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                </Tooltip>
              </Flex>

              <Can has={sold_enabled}>
                <MetricRangeFilter
                  metricLabel="Số món bán ra"
                  unit="món"
                  enabled={sold_enabled}
                  nameMatrix={getFieldName("sold")}
                  nameMin={getFieldName("sold_min")}
                  nameMax={getFieldName("sold_max")}
                  nameNoLimit={getFieldName("sold_no_limit")}
                  minPlaceholder="Nhập số món tối thiểu"
                  maxPlaceholder="Nhập số món tối đa"
                />
              </Can>
            </Flex>

            <Flex align="flex-start" gap={20}>
              <Form.Item<IEditCampaignForm>
                name={getFieldName("avg_video_views_enabled")}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>Số lượt xem trung bình mỗi video</Checkbox>
              </Form.Item>

              <Can has={avg_video_views_enabled}>
                <MetricRangeFilter
                  metricLabel="Số lượt xem trung bình mỗi video"
                  unit="lượt"
                  enabled={avg_video_views_enabled}
                  nameMatrix={getFieldName("avg_video_views")}
                  nameMin={getFieldName("avg_video_views_min")}
                  nameMax={getFieldName("avg_video_views_max")}
                  nameNoLimit={getFieldName("avg_video_views_no_limit")}
                  minPlaceholder="Nhập lượt xem tối thiểu"
                  maxPlaceholder="Nhập lượt xem tối đa"
                />
              </Can>
            </Flex>

            <Flex align="flex-start" gap={20}>
              <Form.Item<IEditCampaignForm>
                name={getFieldName("avg_live_views_enabled")}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>Số lượt xem trung bình mỗi LIVE</Checkbox>
              </Form.Item>

              <Can has={avg_live_views_enabled}>
                <MetricRangeFilter
                  metricLabel="Số lượt xem trung bình mỗi LIVE"
                  unit="lượt"
                  enabled={avg_live_views_enabled}
                  nameMatrix={getFieldName("avg_live_views")}
                  nameMin={getFieldName("avg_live_views_min")}
                  nameMax={getFieldName("avg_live_views_max")}
                  nameNoLimit={getFieldName("avg_live_views_no_limit")}
                  minPlaceholder="Nhập lượt xem tối thiểu"
                  maxPlaceholder="Nhập lượt xem tối đa"
                />
              </Can>
            </Flex>

            <Flex align="center" gap={12}>
              <Flex align="center">
                <Form.Item<IEditCampaignForm>
                  name={getFieldName("engagement_rate_enabled")}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>Tỷ lệ tương tác</Checkbox>
                </Form.Item>
                <Tooltip
                  title="Số lượt tương tác bài đăng (lượt thích, chia sẻ và bình luận) chia cho tổng số lượt xem video trung bình của tất cả video trong 30 ngày qua."
                  style={{ marginLeft: 0 }}
                >
                  <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                </Tooltip>
              </Flex>

              <Can has={engagement_rate_enabled}>
                <RangeMultiSelect
                  dependencies={[[getFieldName("engagement_rate_enabled")]]}
                  rules={conditionRules?.engagement_rate?.(
                    engagement_rate_enabled && !isStoreLocked,
                  )}
                  name={getFieldName("engagement_rate")}
                  options={PERFORMANCE_ENGAGEMENT_OPTIONS}
                  placeholder="Chọn tỷ lệ tương tác"
                />
              </Can>
            </Flex>
          </div>
        </Form.Item>

        <Form.Item<IEditCampaignForm>
          name={getFieldName("note")}
          label={
            <Text>
              Yêu cầu nội dung <span className="form-item-required">*</span>
            </Text>
          }
          rules={conditionRules.note?.(!isStoreLocked)}
        >
          {/* @ts-ignore */}
          <TextEditor
            placeholder="Nhập yêu cầu nội dung"
            onUploadImage={uploadImage}
          />
        </Form.Item>

        <Form.Item>
          <Flex
            align="center"
            justify="space-between"
            style={{
              width: "80%",
            }}
          >
            <Flex vertical>
              <Text strong>Yêu cầu duyệt demo</Text>
              <Text>
                Nếu bật, nhà sáng tạo cần nộp demo để nhãn hàng duyệt trước
                khi đăng
              </Text>
            </Flex>
            <Form.Item<IEditCampaignForm>
              name={getStoreFieldName("has_demo_approval")}
              preserve={false}
              dependencies={[getFieldName("video_enabled")]}
              initialValue={1}
              getValueProps={(value) => ({
                checked: value === undefined || value === 1 || value === true,
              })}
              getValueFromEvent={(checked) => (checked ? 1 : 0)}
              style={{ marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
          </Flex>
        </Form.Item>

        <Form.Item<IEditCampaignForm> label={<Text>Hình thức quảng cáo</Text>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* VIDEO */}
            <Row align="middle" gutter={12}>
              <Col xs={24} sm={8} md={6} lg={5} xl={4}>
                <Form.Item<IEditCampaignForm>
                  name={getFieldName("video_enabled")}
                  valuePropName="checked"
                  noStyle
                  dependencies={[getFieldName("livestream_enabled")]}
                >
                  <Checkbox>Video</Checkbox>
                </Form.Item>
              </Col>

              <Can has={video_enabled}>
                <Col flex="auto">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span>
                      Số lượng video tối thiểu:{" "}
                      <Tooltip title="Số video tối thiểu mà nhà sáng tạo cần đăng cho mỗi sản phẩm đăng ký mẫu. Tổng số video = Số sản phẩm đăng ký mẫu x số video tối thiểu / sản phẩm.">
                        <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                      </Tooltip>
                    </span>

                    <Form.Item<IEditCampaignForm>
                      name={getFieldName("video_count")}
                      preserve={false}
                      rules={conditionRules.video_count?.(
                        video_enabled && !isStoreLocked,
                      )}
                      dependencies={[getFieldName("video_enabled")]}
                      initialValue={1}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        placeholder="Số lượng"
                        style={{ width: 120, height: 32 }}
                        className="custom-input-number"
                        min={1}
                        precision={0}
                        step={1}
                      />
                    </Form.Item>
                    <span>/ 1 sản phẩm</span>
                  </div>
                </Col>
              </Can>
            </Row>

            {/* LIVESTREAM */}
            <Row align="middle" gutter={12}>
              <Col xs={24} sm={8} md={6} lg={5} xl={4}>
                <Form.Item<IEditCampaignForm>
                  name={getFieldName("livestream_enabled")}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>Livestream</Checkbox>
                </Form.Item>
              </Col>

              <Can has={livestream_enabled}>
                <Col flex="auto">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span>
                      Số lượng phiên live tối thiểu:{" "}
                      <Tooltip title="Số livestream tối thiểu NST cần thực hiện cho mỗi lần đăng ký campaign, không phụ thuộc vào số lượng sản phẩm và hàng hoá đăng ký.">
                        <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                      </Tooltip>
                    </span>

                    <Form.Item<IEditCampaignForm>
                      name={getFieldName("live_session_count")}
                      preserve={false}
                      rules={conditionRules.live_session_count?.(
                        livestream_enabled && !isStoreLocked,
                      )}
                      dependencies={[getFieldName("livestream_enabled")]}
                      initialValue={1}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        placeholder="Số lượng"
                        style={{ width: 120, height: 32, textAlign: "center" }}
                        min={1}
                        precision={0}
                        step={1}
                        className="custom-input-number"
                      />
                    </Form.Item>
                    <span>/ 1 lần đăng ký</span>
                  </div>
                </Col>
              </Can>
            </Row>
          </div>
        </Form.Item>

        <Can has={video_enabled || livestream_enabled}>
          <Form.Item<IEditCampaignForm> label="Thời hạn">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Can has={video_enabled && requiresDemoApproval}>
                <Row align="top" gutter={8}>
                  <Col
                    style={{
                      height: 32,
                      lineHeight: "32px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Text>Hạn nhà sáng tạo gửi video demo:</Text>
                  </Col>

                  <Col style={{ width: 110 }}>
                    <Form.Item<IEditCampaignForm>
                      name={getFieldName("video_demo_deadline")}
                      preserve={false}
                      initialValue={5}
                      style={{ marginBottom: 0 }}
                      rules={conditionRules.video_demo_deadline?.(
                        video_enabled &&
                          requiresDemoApproval &&
                          !isStoreLocked,
                      )}
                    >
                      <InputNumber
                        min={1}
                        precision={0}
                        step={1}
                        style={{ width: 100, height: 32, textAlign: "center" }}
                        className="custom-input-number"
                      />
                    </Form.Item>
                  </Col>

                  <Col
                    style={{
                      height: 32,
                      lineHeight: "32px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Text>ngày sau khi nhận sản phẩm mẫu</Text>
                  </Col>
                </Row>
              </Can>

              <Can has={livestream_enabled || video_enabled}>
                <Row align="top" gutter={8}>
                  <Col
                    style={{
                      height: 32,
                      lineHeight: "32px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Text>Hạn nhà sáng tạo đăng bài: </Text>
                    <Tooltip title="Thời hạn đăng bài cần lớn hơn thời hạn gửi demo">
                      <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                    </Tooltip>
                  </Col>
                  <Col style={{ width: 110 }}>
                    <Form.Item<IEditCampaignForm>
                      name={getFieldName("post_demo_deadline")}
                      preserve={false}
                      initialValue={10}
                      style={{ marginBottom: 0 }}
                      dependencies={[getFieldName("video_demo_deadline")]}
                      rules={[
                        ...(conditionRules.post_demo_deadline?.(
                          (livestream_enabled || video_enabled) &&
                            !isStoreLocked,
                        ) ?? []),
                        ...(isStoreLocked ||
                        !video_enabled ||
                        !requiresDemoApproval
                          ? []
                          : [
                              postDemoGreaterThanVideoDemoRule(
                                getFieldName("video_demo_deadline"),
                              ),
                            ]),
                      ]}
                    >
                      <InputNumber
                        min={1}
                        precision={0}
                        step={1}
                        style={{ width: 100, height: 32, textAlign: "center" }}
                        className="custom-input-number"
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    style={{
                      height: 32,
                      lineHeight: "32px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Text>ngày sau khi nhận sản phẩm mẫu</Text>
                  </Col>
                </Row>
              </Can>
            </div>
          </Form.Item>
        </Can>
      </div>
    </SectionExpand>
  );
};

export default SectionRequirement;
