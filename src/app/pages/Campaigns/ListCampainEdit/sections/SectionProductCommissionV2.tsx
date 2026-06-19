import React, { CSSProperties, useEffect, useMemo, useState } from 'react'
import { Button, Flex, Form, Image, Input, InputNumber, Switch, Table, Tooltip, Typography } from 'antd'
import { showAlert } from 'utils/helper'
import { SectionExpand } from 'app/pages/Campaigns/components'
import { DownOutlined, EditOutlined, InfoCircleOutlined, RightOutlined, UploadOutlined } from '@ant-design/icons'
import { useImportCommission, useWatchProductCommission } from '../hooks'
import { isCampaignStoreLocked } from '../hooks/useStoreLockStatus'
import dayjs from 'dayjs'
import { mapProductsWithImportedCommission } from '../mappers/productCommission.mapper'
import {
  PRODUCT_REQUIRED_MESSAGES,
  validateCampaignProductCommission,
  validateProductField,
} from "../validation/EditCampaign.validation"
import { ICampaignProduct, IEditCampaignForm } from 'app/pages/Campaigns/types'
import ModalImportCommissionErrors from 'app/pages/Campaigns/ListCampainEdit/sections/ModalImportCommissionErrors'
import ModalGuide from 'app/pages/Campaigns/ListCampainEdit/sections/ModalGuide'
import CopyText from 'app/pages/Campaigns/components/CopyText'

const { Text } = Typography

type SectionProductCommissionProps = {
  activeStoreIndex: number;
  isStoreLocked?: boolean;
  campaignId?: number;
  dataScGetProductByIds?: any[];
};

const PRODUCT_FIELD_VALIDATIONS: Array<{ field: string; required?: boolean }> = [
  { field: "creatorCommissionRate", required: true },
  { field: "referralLink", required: true },
  { field: "totalShopAdsCommissionRate" },
  { field: "openCollaborationShopAdsRate" },
  { field: "creatorShopAdsCommissionRate" },
]

const SectionProductCommission = ({
  activeStoreIndex,
  isStoreLocked = false,
  campaignId,
  dataScGetProductByIds = [],
}: SectionProductCommissionProps) => {
  const form = Form.useFormInstance<IEditCampaignForm>()

  const {
    confirmLoading,
    uploadLoading,
    canConfirm,
    listCommission,
    listErrorCommission,
    visibleModal,
    visibleGuide,
    closeModal,
    closeGuide,
    uploadProps,
    confirmImport,
    openGuide,
    fileName,
  } = useImportCommission(campaignId);

  const { products } = useWatchProductCommission(form, activeStoreIndex)

  useEffect(() => {
    if (!listCommission.length) return

    const allStores = (form.getFieldValue("stores") || []) as any[]
    const nextStores = allStores.map((store) => ({
      ...store,
      products: mapProductsWithImportedCommission(store.products || [], listCommission),
    }))
    form.setFieldsValue({ stores: nextStores })
    // Re-run validator after imported data updates product fields.
    form.validateFields(["productCommission"]).catch(() => undefined)
  }, [listCommission, form])

  const [editingCellKey, setEditingCellKey] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string | number | null>(null)
  const [editingError, setEditingError] = useState<string | null>(null)
  const [showTableValidationErrors, setShowTableValidationErrors] = useState(false)
  const isApprovedProduct = (product: ICampaignProduct) => product?.status === "APPROVED"
  const [variantRevision, setVariantRevision] = useState(0)

  const productTableData = useMemo(() => {
    void variantRevision
    return (products || []).reduce((acc: any[], item: ICampaignProduct, index: number) => {
      if (!isApprovedProduct(item)) return acc

      const hiddenVariantIds =
        form.getFieldValue(["stores", activeStoreIndex, "products", index, "hiddenVariantIds"]) ??
        item.hiddenVariantIds ??
        []

      acc.push({
        key: String(item.id ?? item.refProductId ?? item.scProductId ?? index),
        index,
        scProductId: item.scProductId,
        productImageUrl: item.productImageUrl || "",
        productName: item.productName || "--",
        refProductId: item.refProductId || item.scProductId || "--",
        registerDate: item.registerDate
          ? dayjs(item.registerDate).format("DD/MM/YYYY")
          : undefined,
        totalCommissionRate: item.totalCommissionRate,
        totalShopAdsCommissionRate: item.totalShopAdsCommissionRate,
        creatorCommissionRate: item.creatorCommissionRate,
        creatorShopAdsCommissionRate: item.creatorShopAdsCommissionRate,
        referralLink: item.referralLink || "",
        price: item.price,
        stock: item.stock,
        stockSample: item.stockSample,
        soldCount: item.soldCount,
        openCollaborationShopAdsRate: item.openCollaborationShopAdsRate ?? null,
        hiddenVariantIds,
      })

      return acc
    }, [])
  }, [products, variantRevision, form, activeStoreIndex])

  const variantsByProductId = useMemo(() => {
    const map = new Map<number, any[]>()
      ; (dataScGetProductByIds || []).forEach((group: any) => {
        ; (group?.products || []).forEach((product: any) => {
          const productId = Number(product?.id)
          if (!Number.isNaN(productId)) {
            map.set(productId, product?.productVariants || [])
          }
        })
      })
    return map
  }, [dataScGetProductByIds])

  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    )
  }

  useEffect(() => {
    const defaultKeys = productTableData
      .filter((record: any) => (variantsByProductId.get(Number(record?.scProductId))?.length ?? 0) > 0)
      .map((record: any) => record.key)
    setExpandedKeys(defaultKeys)
  }, [productTableData, variantsByProductId])

  const getHiddenVariantIds = (record: any) => {
    void variantRevision
    const fromForm = form.getFieldValue([
      "stores",
      activeStoreIndex,
      "products",
      record.index,
      "hiddenVariantIds",
    ])
    return (fromForm ?? record?.hiddenVariantIds ?? []) as number[]
  }

  const isVariantEnabled = (record: any, variantId: string | number) =>
    !getHiddenVariantIds(record).some((id) => Number(id) === Number(variantId))

  const countEnabledVariants = (record: any, variants: any[]) =>
    variants.filter((variant) => isVariantEnabled(record, variant?.id)).length

  const isVariantSwitchDisabled = (record: any, variant: any, variants: any[]) => {
    if (isStoreLocked) return true
    const enabledCount = countEnabledVariants(record, variants)
    return enabledCount === 1 && isVariantEnabled(record, variant?.id)
  }

  const handleVariantSwitchChange = (
    record: any,
    variant: any,
    variants: any[],
    checked: boolean,
  ) => {
    if (!checked && countEnabledVariants(record, variants) <= 1 && isVariantEnabled(record, variant?.id)) {
      return
    }

    const variantIdNum = Number(variant?.id)
    const currentHidden = getHiddenVariantIds(record)
    const nextHidden = checked
      ? currentHidden.filter((id) => Number(id) !== variantIdNum)
      : currentHidden.some((id) => Number(id) === variantIdNum)
        ? currentHidden
        : [...currentHidden, variantIdNum]

    form.setFieldValue(
      ["stores", activeStoreIndex, "products", record.index, "hiddenVariantIds"],
      nextHidden,
    )
    setVariantRevision((prev) => prev + 1)
  }

  const renderVariantRows = (record: any, variants: any[]) => {
    return (
      <Flex vertical gap={16} style={{ paddingLeft: 35 }}>
        {variants.map((variant: any) => (
          <Flex key={String(variant?.id)} align="center" gap={16}>
            <Flex vertical style={{ width: 220 }}>
              <Text>{variant?.name || "--"}</Text>
              <Text type="secondary" ellipsis={{ tooltip: variant?.sku ?? "--" }} style={{ fontSize: 12 }}>
                SKU: {variant?.sku ?? "--"}
              </Text>
              <Text type="secondary" ellipsis={{ tooltip: variant?.stock_on_hand ?? "--" }} style={{ fontSize: 12 }}>
                Có sẵn: {variant?.stock_on_hand ?? "--"}
              </Text>
            </Flex>
            <Switch
              disabled={isVariantSwitchDisabled(record, variant, variants)}
              checked={isVariantEnabled(record, variant?.id)}
              onChange={(checked) => handleVariantSwitchChange(record, variant, variants, checked)}
            />
          </Flex>
        ))}
      </Flex>
    )
  }

  const getCellKey = (rowKey: string, field: string) => `${rowKey}-${field}`

  const startEdit = (cellKey: string, currentValue: string | number | null) => {
    setEditingCellKey(cellKey)
    setEditingValue(currentValue ?? null)
    setEditingError(null)
  }

  const cancelEdit = () => {
    setEditingCellKey(null)
    setEditingValue(null)
    setEditingError(null)
  }

  const confirmEdit = (
    record: any,
    field: string,
    required = false
  ) => {
    const error = validateProductField(field, editingValue, record, required)
    if (error) {
      setEditingError(error)
      return
    }

    const nextValue =
      field === "referralLink"
        ? String(editingValue || "").trim()
        : editingValue == null ? null : Number(editingValue)

    const allStores = (form.getFieldValue("stores") || []) as any[]
    const targetStore = { ...(allStores[activeStoreIndex] || {}) }
    const productsInStore = [...(targetStore.products || [])] as any[]
    productsInStore[record.index] = {
      ...(productsInStore[record.index] || {}),
      [field]: nextValue,
    }
    targetStore.products = productsInStore
    const nextStores = [...allStores]
    nextStores[activeStoreIndex] = targetStore
    form.setFieldsValue({ stores: nextStores })
    cancelEdit()
  }

  const validateProductByFieldRules = (product: any) => {
    for (const { field, required = false } of PRODUCT_FIELD_VALIDATIONS) {
      const errorMessage = validateProductField(field, product?.[field], product, required)
      if (errorMessage) return errorMessage
    }
    return null
  }

  const validateAllProducts = async () => {
    setShowTableValidationErrors(true)
    const allValues = form.getFieldsValue(true)
    const stores = (allValues?.stores || []) as any[]
    for (const store of stores) {
      if (isCampaignStoreLocked(store)) continue;
      const productsInStore = (store?.products || []) as any[]
      for (const product of productsInStore) {
        if (!isApprovedProduct(product)) continue
        const fieldError = validateProductByFieldRules(product)
        if (fieldError) {
          const isRequired = (Object.values(PRODUCT_REQUIRED_MESSAGES) as string[]).includes(fieldError)
          if (isRequired) showAlert.error(fieldError)
          return Promise.reject(new Error(fieldError))
        }

        const errorMessage = validateCampaignProductCommission(product)
        if (errorMessage) {
          const isRequired = (Object.values(PRODUCT_REQUIRED_MESSAGES) as string[]).includes(errorMessage)
          if (isRequired) showAlert.error(errorMessage)
          return Promise.reject(new Error(errorMessage))
        }
      }
    }
    setShowTableValidationErrors(false)
    return Promise.resolve()
  }

  type RenderEditableNumberOptions = {
    textStyle?: CSSProperties;
    alignRight?: boolean;
  };

  // Helper hiển thị lỗi dưới input — giống style AntD Form.Item
  const renderFieldError = (cellKey: string, defaultError?: string | null) => {
    const displayError =
      editingCellKey === cellKey && editingError
        ? editingError
        : showTableValidationErrors
          ? defaultError
          : null
    return displayError ? (
      <Text type="danger" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
        {displayError}
      </Text>
    ) : null
  }

  const renderEditableNumber = (
    value: number,
    record: any,
    field:
      | "creatorCommissionRate"
      | "creatorShopAdsCommissionRate"
      | "totalShopAdsCommissionRate"
      | "openCollaborationShopAdsRate",
    required = false,
    options?: RenderEditableNumberOptions,
  ) => {
    const { textStyle, alignRight = true } = options || {};
    if (isStoreLocked) {
      return (
        <Flex align="center" justify={alignRight ? "end" : "start"} gap={6}>
          <Text style={textStyle}>{value == null ? "--" : `${value}%`}</Text>
        </Flex>
      );
    }

    const cellKey = getCellKey(record.key, field)
    const isEditing = editingCellKey === cellKey
    const defaultError = validateProductField(field, value, record, required)
    return isEditing ? (
      <Flex vertical align={alignRight ? "end" : "start"}>
        <InputNumber
          autoFocus
          addonAfter="%"
          style={{ width: 120 }}
          value={editingValue == null ? null : Number(editingValue)}
          onChange={(val) => { setEditingValue(val); setEditingError(null) }}
          status={editingError ? "error" : undefined}
          onBlur={() => confirmEdit(record, field, required)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); confirmEdit(record, field, required) }
            if (e.key === "Escape") cancelEdit()
          }}
        />
        {renderFieldError(cellKey, defaultError)}
      </Flex>
    ) : (
      <Flex vertical align={alignRight ? "end" : "start"}>
        <Flex align="center" justify={alignRight ? "end" : "start"} gap={6}>
          <Text style={textStyle}>{value == null ? "--" : `${value}%`}</Text>
          <EditOutlined
            style={{ fontSize: 16, cursor: 'pointer' }}
            onClick={() => startEdit(cellKey, value)}
          />
        </Flex>
        {renderFieldError(cellKey, defaultError)}
      </Flex>
    )
  }

  const renderEditableLink = (value: string, record: any) => {
    const trimmedValue = String(value || "").trim()

    const renderLinkContent = () => (
      <Flex align="center" justify="end" gap={6}>
        {trimmedValue ? (
          <CopyText
            text={trimmedValue}
            hideIcon={false}
          >
            <a href={trimmedValue} target="_blank" rel="noreferrer">Link</a>
          </CopyText>
        ) : (
          <Text type="secondary">--</Text>
        )}
      </Flex>
    )

    if (isStoreLocked) {
      return (
        renderLinkContent()
      );
    }

    const cellKey = getCellKey(record.key, "referralLink")
    const isEditing = editingCellKey === cellKey
    const defaultError = validateProductField("referralLink", value, record, true)

    return isEditing ? (
      <Flex vertical>
        <Input
          autoFocus
          placeholder="Nhập link giới thiệu"
          value={String(editingValue || "")}
          status={editingError ? "error" : undefined}
          onChange={(e) => { setEditingValue(e.target.value); setEditingError(null) }}
          onBlur={() => confirmEdit(record, "referralLink", true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); confirmEdit(record, "referralLink", true) }
            if (e.key === "Escape") cancelEdit()
          }}
        />
        {renderFieldError(cellKey, defaultError)}
      </Flex>
    ) : (
      <Flex vertical align="end">
        <Flex align="center" justify="end" gap={6}>
          {renderLinkContent()}
          <EditOutlined
            style={{ fontSize: 16, cursor: 'pointer' }}
            onClick={() => startEdit(cellKey, value)}
          />
        </Flex>
        {renderFieldError(cellKey, defaultError)}
      </Flex>
    )
  }

  const columns = [
    {
      title: (
        <Flex align="center" gap={4}>
          <Text>Sản phẩm</Text>
          <Tooltip title="Đối với sản phẩm có lớn hơn 1 hàng hóa, có thể lựa chọn hiển thị hàng hóa mong muốn trên nền tảng nhà sáng tạo">
            <InfoCircleOutlined />
          </Tooltip>
        </Flex>
      ),
      dataIndex: 'productName',
      key: 'productName',
      fixed: 'left',
      width: 360,
      render: (value: string, record: any) => {
        const variants = variantsByProductId.get(Number(record?.scProductId)) || []
        const hasVariants = variants.length > 0
        const isExpanded = expandedKeys.includes(record.key)
        return (
          <Flex vertical gap={12}>
            <Flex align="center" justify="space-between">
              <Flex align="center" gap={6}>
                <Image src={record?.productImageUrl} width={48} height={48} style={{ objectFit: "cover", borderRadius: 6 }} />
                <Flex vertical gap={4}>
                  <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 220 }} >{value}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ID: {record?.refProductId ?? record?.scProductId ?? "--"}
                  </Text>
                </Flex>
              </Flex>
              {hasVariants ? (
                isExpanded ? (
                  <DownOutlined
                    style={{ cursor: 'pointer', fontSize: 12 }}
                    onClick={() => toggleExpand(record.key)}
                  />
                ) : (
                  <RightOutlined
                    style={{ cursor: 'pointer', fontSize: 12 }}
                    onClick={() => toggleExpand(record.key)}
                  />
                )
              ) : (
                <span style={{ display: 'inline-block', width: 12 }} />
              )}
            </Flex>
            {hasVariants && isExpanded && (
              <div style={{ paddingLeft: 18 }}>{renderVariantRows(record, variants)}</div>
            )}
          </Flex>
        )
      },
    },
    {
      title: 'Tổng tỷ lệ hoa hồng',
      dataIndex: 'totalCommissionRate',
      key: 'totalCommissionRate',
      align: 'right',
      width: 160,
      render: (value: number | null | undefined, record: any) => (
        <Flex vertical align="end">
          <Text>{value == null ? "--" : `${value}%`}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            So với {record.openCollaborationCommissionRate ?? "--"}% của cộng tác mở
          </Text>
        </Flex>
      ),
    },
    {
      title: 'Tổng tỷ lệ hoa hồng quảng cáo cửa hàng',
      dataIndex: 'totalShopAdsCommissionRate',
      key: 'totalShopAdsCommissionRate',
      align: 'right',
      width: 190,
      render: (value: number, record: any) => {
        const cellKey = getCellKey(record.key, "openCollaborationAdsCommissionRate")
        const isEditingOpenCollab = editingCellKey === cellKey
        const openCollabError = validateProductField(
          "openCollaborationShopAdsRate",
          record.openCollaborationShopAdsRate,
          record,
          false
        )

        return (
          <Flex vertical align="end" gap={2}>
            {renderEditableNumber(value, record, "totalShopAdsCommissionRate")}

            {isEditingOpenCollab ? (
              <Flex align="end" justify="end" vertical gap={2}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  So với Quảng cáo cửa hàng trong cộng tác mở
                </Text>
                <InputNumber
                  autoFocus
                  addonAfter="%"
                  size="small"
                  style={{ width: 120 }}
                  value={editingValue == null ? null : Number(editingValue)}
                  status={editingError ? "error" : undefined}
                  onChange={(val) => { setEditingValue(val); setEditingError(null) }}
                  onBlur={() => confirmEdit(record, "openCollaborationShopAdsRate", false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); confirmEdit(record, "openCollaborationShopAdsRate", false) }
                    if (e.key === "Escape") cancelEdit()
                  }}
                />
                {renderFieldError(cellKey, openCollabError)}
              </Flex>
            ) : (
              <Flex vertical align="end">
                <Text type="secondary" style={{ fontSize: 12, textAlign: 'right' }}>
                  So với Quảng cáo cửa hàng trong cộng tác mở {record.openCollaborationShopAdsRate ?? "--"}%{" "}
                  {!isStoreLocked && (
                    <EditOutlined
                      style={{ fontSize: 12, cursor: 'pointer' }}
                      onClick={() => startEdit(cellKey, record.openCollaborationShopAdsRate)}
                    />
                  )}
                </Text>
                {renderFieldError(cellKey, openCollabError)}
              </Flex>
            )}
          </Flex>
        )
      },
    },
    {
      title: (<Text>Tỷ lệ hoa hồng của nhà sáng tạo <span className='form-item-required'>*</span></Text>),
      dataIndex: 'creatorCommissionRate',
      key: 'creatorCommissionRate',
      align: 'right',
      width: 160,
      render: (value: number, record: any) =>
        renderEditableNumber(value, record, "creatorCommissionRate", true),
    },
    {
      title: 'Tỷ lệ hoa hồng QC cửa hàng của nhà sáng tạo',
      dataIndex: 'creatorShopAdsCommissionRate',
      key: 'creatorShopAdsCommissionRate',
      align: 'right',
      width: 160,
      render: (value: number, record: any) =>
        renderEditableNumber(value, record, "creatorShopAdsCommissionRate"),
    },
    {
      title: (<Text>Link giới thiệu <span className='form-item-required'>*</span></Text>),
      dataIndex: 'referralLink',
      key: 'referralLink',
      align: 'right',
      width: 160,
      render: (value: string, record: any) => renderEditableLink(value, record),
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 100,
      render: (value: number) =>
        value == null ? "--" : `${value.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Hàng có sẵn',
      dataIndex: 'stock',
      key: 'stock',
      align: 'right',
      width: 100,
      render: (value: number) =>
        value == null ? "--" : `${value}`,
    },
    {
      title: 'Mẫu có sẵn',
      dataIndex: 'stockSample',
      key: 'stockSample',
      align: 'right',
      width: 100,
      render: (value: number) =>
        value == null ? "--" : `${value}`,
    },
    {
      title: 'Số món bán ra',
      dataIndex: 'soldCount',
      key: 'soldCount',
      align: 'right',
      width: 100,
      render: (value: number) =>
        value == null ? "--" : `${value}`,
    },
  ]

  return (
    <>
      <SectionExpand title="2. Sản phẩm & hoa hồng" titleStyle={{ margin: '18px 0' }} style={{ margin: '18px 0' }}>

        <Flex align='center' justify='space-between' style={{ margin: '18px 0' }}>
          <Flex align="center" gap={10}>
            <Text>Tiền công</Text>
            <Form.Item<IEditCampaignForm>
              name={["stores", activeStoreIndex, "wageAmount"]}
              validateFirst
              style={{ marginBottom: 0 }}
            >
              <InputNumber<number>
                disabled={isStoreLocked}
                placeholder="Nhập tiền công"
                addonAfter="VNĐ"
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  value != null
                    ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : ""
                }
                parser={(value) =>
                  value ? Number(value.replace(/\D/g, "")) : null as any
                }
              />
            </Form.Item>
          </Flex>

          <Button onClick={openGuide} type='primary' icon={<UploadOutlined />}>Tải file</Button>
        </Flex>
        <Form.Item<IEditCampaignForm>>
          <Table
            dataSource={productTableData}
            columns={(columns as any[]).map((col) => ({
              ...col,
              onCell: () => ({ style: { verticalAlign: 'top' } }),
            }))}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} sản phẩm`,
            }}
            scroll={{ x: 1500 }}
          />
        </Form.Item>

        <Form.Item<IEditCampaignForm>
          name="productCommission"
          rules={[{ validator: () => validateAllProducts() }]}
          hidden
        >
          <Input />
        </Form.Item>
      </SectionExpand>

      <ModalImportCommissionErrors
        show={visibleModal}
        onHide={closeModal}
        data={listErrorCommission}
        totalSuccess={listCommission.length}
        totalFailed={listErrorCommission.length}
      />

      <ModalGuide
        show={visibleGuide}
        onHide={closeGuide}
        modalGuideUploadProps={uploadProps}
        canConfirm={canConfirm}
        onConfirm={confirmImport}
        confirmLoading={confirmLoading}
        uploadLoading={uploadLoading}
        fileName={fileName}
      />
    </>
  )
}

export default SectionProductCommission
