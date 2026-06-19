import {
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Affix,
  Anchor,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Row,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import ModalConfirm from "app/components/ModalConfirm";
import { useLayoutContext } from "app/contexts/LayoutContext";
import ModalShowCampaign from "app/pages/Campaigns/ListCampaign/components/modal/ModalShowCampaign";
import {
  isCampaignStoreLocked,
  useBlocker,
  useCampaignStoreTabs,
  useDetailCampaign,
  useStoreLockStatus,
} from "app/pages/Campaigns/ListCampainEdit/hooks";
import {
  SectionCampaignInfoPlatform,
  SectionGeneralInfo,
  SectionProductCommission,
  SectionProductCommissionV2,
  SectionRequirement,
} from "app/pages/Campaigns/ListCampainEdit/sections";
import { editCampaignMapper } from "app/pages/Campaigns/mappers";
import { IEditCampaignForm } from "app/pages/Campaigns/types";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { CampaignWrapper } from "../Campaign.styles";
import { buildUpsertCampaignInput } from "../mappers/upsertInput.mapper";

const { Text } = Typography;
const { Link } = Anchor;

const EditCampaign = () => {
  const { appendBreadcrumb } = useLayoutContext();
  const { id } = useParams<{ id: string }>();
  const campaignId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  useLayoutEffect(() => {
    appendBreadcrumb([
      {
        title: "Danh sách chiến dịch",
        pathname: "/campaign-manage",
      },
      {
        title: "Sửa chiến dịch",
        pathname: "/campaign-manage/edit-campaign/:id",
      },
    ]);
  }, []);

  const [form] = Form.useForm<IEditCampaignForm>();
  const watchedStores = Form.useWatch("stores", form);
  const [isExpandedSectionA, setIsExpandedSectionA] = useState(true);
  const [isExpandedSectionB, setIsExpandedSectionB] = useState(true);
  const [isCollapsedToc, setIsCollapsedToc] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const blocker = useBlocker(isChanged);
  useEffect(() => {
    if (blocker.state === "blocked") {
      setVisibleModal(true);
    }
  }, [blocker.state]);

  const { dataDetailCampaign, loadingDetailCampaign, dataScGetProductByIds } =
    useDetailCampaign(campaignId);

  const initialValues = useMemo(() => {
    return dataDetailCampaign
      ? editCampaignMapper.mapToForm(dataDetailCampaign)
      : undefined;
  }, [dataDetailCampaign]);

  const { activeKey, activeStoreIndex, handleChangeTab, tabItems, stores } =
    useCampaignStoreTabs({
      stores: initialValues?.stores,
    });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const { updateCampaign, loadingUpdateCampaign } =
    useDetailCampaign(campaignId);

  const partnerAccountId = useMemo(() => {
    return dataDetailCampaign?.partnerAccountId;
  }, [dataDetailCampaign]);

  const isActiveStoreLocked = useStoreLockStatus({
    form,
    activeStoreIndex,
    initialStores: initialValues?.stores,
  });

  const isAllStoresLocked = useMemo(() => {
    const initialStores = initialValues?.stores ?? [];
    const storesForCheck = initialStores.map((store, index) => ({
      ...store,
      ...(watchedStores?.[index] ?? {}),
    }));

    if (!storesForCheck.length) return false;

    return storesForCheck.every((store: any) => isCampaignStoreLocked(store));
  }, [initialValues?.stores, watchedStores]);

  const messageError = useMemo(() => {
    const stores: any[] = dataDetailCampaign?.stores ?? [];
    return stores[activeStoreIndex]?.messageError ?? null;
  }, [dataDetailCampaign, activeStoreIndex]);

  const [openModalShowCampaign, setOpenModalShowCampaign] = useState(false);

  const handleUpdateCampaign = async (values: IEditCampaignForm) => {
    const currentFormValues = form.getFieldsValue(true);
    const input = buildUpsertCampaignInput(
      currentFormValues,
      Number(id),
      partnerAccountId,
    );
    setIsChanged(false);
    try {
      const { data } = await updateCampaign({ variables: { input: input.input } });
      if (!data?.affUpsertCampaign?.success) {
        setIsChanged(true);
      }
    } catch (error) {
      setIsChanged(true);
      throw error;
    }
  };

  const handleOpenShowCampaignModal = async () => {
    try {
      await form.validateFields();
      setOpenModalShowCampaign(true);
    } catch {
      // Ant Design Form hiển thị lỗi validate trên các field.
    }
  };

  const handleShowCampaign = async () => {
    try {
      await form.validateFields();
    } catch {
      setOpenModalShowCampaign(false);
      return;
    }

    const currentFormValues = form.getFieldsValue(true);
    const input = buildUpsertCampaignInput(
      currentFormValues,
      Number(id),
      partnerAccountId,
      { visibleToCreator: 1 },
    );
    setIsChanged(false);
    try {
      const { data } = await updateCampaign({ variables: { input: input.input } });
      if (!data?.affUpsertCampaign?.success) {
        setIsChanged(true);
      }
    } catch (error) {
      setIsChanged(true);
      throw error;
    }
    setOpenModalShowCampaign(false);
  };

  const onBackNavigate = () => {
    navigate("/campaign-manage/list-campaign");
  };

  return (
    <>
      <CampaignWrapper>
        <Helmet titleTemplate="Sửa chiến dịch" defaultTitle="Sửa chiến dịch">
          <meta name="description" content="Sửa chiến dịch" />
        </Helmet>

        <Spin spinning={loadingUpdateCampaign}>
          <>
            <Row gutter={24}>
              {/* ================= LEFT CONTENT ================= */}
              <Col span={isCollapsedToc ? 22 : 18} className="main-col">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateCampaign}
                  onValuesChange={() => {
                    setIsChanged(true);
                  }}
                >
                  <Spin spinning={loadingDetailCampaign}>
                    {/* ===== A ===== */}
                    <Card style={{ marginBottom: 16 }}>
                      <div id="general-info">
                        <Flex
                          align="center"
                          gap={8}
                          style={{
                            cursor: "pointer",
                            marginBottom: isExpandedSectionA ? 16 : 0,
                          }}
                          onClick={() => setIsExpandedSectionA((prev) => !prev)}
                        >
                          <Text style={{ fontWeight: 600, fontSize: 16 }}>
                            A. THÔNG TIN CHUNG
                          </Text>
                          {isExpandedSectionA ? (
                            <DownOutlined />
                          ) : (
                            <RightOutlined />
                          )}
                        </Flex>
                      </div>
                      <div
                        className={`section-content ${
                          isExpandedSectionA ? "expanded" : "collapsed"
                        }`}
                      >
                        <div className="section-inner">
                          <SectionGeneralInfo />
                        </div>
                      </div>
                    </Card>
                    {/* ===== B ===== */}

                    <Card style={{ marginBottom: 16 }}>
                      <div id="campaign-platform">
                        <Flex
                          align="center"
                          gap={8}
                          style={{
                            cursor: "pointer",
                            marginBottom: isExpandedSectionB ? 16 : 0,
                          }}
                          onClick={() => setIsExpandedSectionB((prev) => !prev)}
                        >
                          <Text style={{ fontWeight: 600, fontSize: 16 }}>
                            B. THÔNG TIN CHIẾN DỊCH TRÊN NỀN TẢNG NHÀ SÁNG TẠO
                          </Text>
                          {isExpandedSectionB ? (
                            <DownOutlined />
                          ) : (
                            <RightOutlined />
                          )}
                        </Flex>
                      </div>

                      <div
                        className={`section-content ${
                          isExpandedSectionB ? "expanded" : "collapsed"
                        }`}
                      >
                        <div className="section-inner">
                          <div id="campaign-platform-info">
                            <SectionCampaignInfoPlatform
                              stores={stores}
                              activeKey={activeKey}
                              activeStoreIndex={activeStoreIndex}
                              tabItems={tabItems}
                              onChangeTab={handleChangeTab}
                              isStoreLocked={isActiveStoreLocked}
                            />
                          </div>

                          <div id="campaign-commission">
                            <SectionProductCommissionV2
                              activeStoreIndex={activeStoreIndex}
                              isStoreLocked={isActiveStoreLocked}
                              campaignId={campaignId}
                              dataScGetProductByIds={dataScGetProductByIds}
                            />
                          </div>

                          <div id="campaign-requirement">
                            <SectionRequirement
                              activeStoreIndex={activeStoreIndex}
                              isStoreLocked={isActiveStoreLocked}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Spin>
                  {/* ===== ACTIONS ===== */}
                  <Flex justify="end" gap={10} style={{ marginTop: 16 }}>
                    <Button className="btn-base" onClick={() => form.submit()}>
                      Lưu
                    </Button>
                    <Tooltip title={messageError ?? undefined}>
                      <Button
                        type="primary"
                        className="btn-base"
                        disabled={!!messageError || isAllStoresLocked}
                        onClick={handleOpenShowCampaignModal}
                      >
                        Lưu và Hiển thị
                      </Button>
                    </Tooltip>
                    <Button className="btn-base" onClick={onBackNavigate}>
                      Hủy
                    </Button>
                  </Flex>
                </Form>
              </Col>

              {/* ================= RIGHT ANCHOR ================= */}
              <Col span={isCollapsedToc ? 2 : 6} className="toc-col">
                <Affix offsetTop={120}>
                  <Card>
                    <Flex
                      align="center"
                      justify={isCollapsedToc ? "center" : "space-between"}
                      style={{ marginBottom: isCollapsedToc ? 0 : 16 }}
                    >
                      {!isCollapsedToc && (
                        <Text style={{ fontWeight: 600, fontSize: 16 }}>
                          MỤC LỤC
                        </Text>
                      )}
                      <Button
                        type="text"
                        size="small"
                        icon={
                          isCollapsedToc ? (
                            <MenuFoldOutlined />
                          ) : (
                            <MenuUnfoldOutlined />
                          )
                        }
                        onClick={() => setIsCollapsedToc((prev) => !prev)}
                      />
                    </Flex>
                    {!isCollapsedToc && (
                      <Anchor>
                        <Link href="#general-info" title="A. THÔNG TIN CHUNG" />

                        <Link
                          href="#campaign-platform"
                          title={
                            "B. THÔNG TIN CHIẾN DỊCH TRÊN NỀN TẢNG NHÀ SÁNG TẠO"
                          }
                        >
                          <Link
                            href="#campaign-platform-info"
                            title="1. Thông tin cơ bản"
                          />
                          <Link
                            href="#campaign-commission"
                            title="2. Sản phẩm & hoa hồng"
                          />
                          <Link
                            href="#campaign-requirement"
                            title="3. Yêu cầu"
                          />
                        </Link>
                      </Anchor>
                    )}
                  </Card>
                </Affix>
              </Col>
            </Row>
          </>
        </Spin>
        <ModalShowCampaign
          show={openModalShowCampaign}
          onHide={() => setOpenModalShowCampaign(false)}
          onConfirm={handleShowCampaign}
          checked={true}
        />
      </CampaignWrapper>

      <ModalConfirm
        open={visibleModal}
        onHide={() => {
          setVisibleModal(false);
          blocker.reset();
        }}
        loading={false}
        title="Bạn có thay đổi chưa được lưu. Nếu rời khỏi trang, các thay đổi này sẽ bị mất. Bạn có chắc chắn muốn tiếp tục không?"
        confirmTitle="Xác nhận"
        cancelTitle="Quay lại"
        onConfirm={() => {
          setVisibleModal(false);
          blocker.proceed();
        }}
      />
    </>
  );
};

export default EditCampaign;
