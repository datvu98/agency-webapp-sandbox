import React, { CSSProperties, useEffect, useMemo, useState } from 'react'
import { Button, Flex, Form, Image, Input, InputNumber, Table, Typography, Upload } from 'antd'
import { showAlert } from 'utils/helper'
import { SectionExpand } from 'app/pages/Campaigns/components'
import { EditOutlined, UploadOutlined } from '@ant-design/icons'
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
import CopyText from 'app/pages/Campaigns/components/CopyText'

const { Text } = Typography

type SectionProductCommissionProps = {
  activeStoreIndex: number;
  isStoreLocked?: boolean;
  campaignId?: number;
};

const SectionProductCommission = ({
  activeStoreIndex,
  isStoreLocked = false,
  campaignId,
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
    openModal,
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
  }, [listCommission, form])

  const [editingCellKey, setEditingCellKey] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string | number | null>(null)
  const [editingError, setEditingError] = useState<string | null>(null)
  const isApprovedProduct = (product: ICampaignProduct) => product?.status === "APPROVED"
  const productTableData = useMemo(() => {
    const mergedProducts = mapProductsWithImportedCommission(products || [], listCommission)

    return mergedProducts.reduce((acc: any[], item: ICampaignProduct, index: number) => {
      if (!isApprovedProduct(item)) return acc

      acc.push({
        key: String(item.id ?? item.refProductId ?? item.scProductId ?? index),
        index,
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
      })

      return acc
    }, [])
  }, [products, listCommission])


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

  // Validate → nếu hợp lệ thì ghi vào form và đóng cell
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

  const validateAllProducts = async () => {
    const allValues = form.getFieldsValue(true)
    const stores = (allValues?.stores || []) as any[]
    for (const store of stores) {
      if (isCampaignStoreLocked(store)) continue;
      const productsInStore = (store?.products || []) as any[]
      for (const product of productsInStore) {
        if (!isApprovedProduct(product)) continue
        const errorMessage = validateCampaignProductCommission(product)
        if (errorMessage) {
          const isRequired = (Object.values(PRODUCT_REQUIRED_MESSAGES) as string[]).includes(errorMessage)
          if (isRequired) showAlert.error(errorMessage)
          return Promise.reject(new Error(errorMessage))
        }
      }
    }
    return Promise.resolve()
  }

  type RenderEditableNumberOptions = {
    textStyle?: CSSProperties;
    alignRight?: boolean;
  };

  // Helper hiển thị lỗi dưới input — giống style AntD Form.Item
  const renderFieldError = (cellKey: string) =>
    editingCellKey === cellKey && editingError ? (
      <Text type="danger" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
        {editingError}
      </Text>
    ) : null

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
        {renderFieldError(cellKey)}
      </Flex>
    ) : (
      <Flex align="center" justify={alignRight ? "end" : "start"} gap={6}>
        <Text style={textStyle}>{value == null ? "--" : `${value}%`}</Text>
        <EditOutlined
          style={{ fontSize: 16, cursor: 'pointer' }}
          onClick={() => startEdit(cellKey, value)}
        />
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
      return renderLinkContent();
    }

    const cellKey = getCellKey(record.key, "referralLink")
    const isEditing = editingCellKey === cellKey

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
        {renderFieldError(cellKey)}
      </Flex>
    ) : (
      <Flex align="center" justify="end" gap={6}>
        {renderLinkContent()}
        <EditOutlined
          style={{ fontSize: 16, cursor: 'pointer' }}
          onClick={() => startEdit(cellKey, value)}
        />
      </Flex>
    )
  }

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      fixed: 'left',
      width: 340,
      render: (value: string, record: any) => (
        <Flex align="center" gap={6}>
          <Image src={record?.productImageUrl} width={48} height={48} style={{ objectFit: "cover", borderRadius: 6 }} />
          <Flex vertical gap={4}>
            <Text ellipsis={{ tooltip: value }} style={{ maxWidth: 250 }} >{value}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record?.refProductId ?? record?.scProductId ?? "--"}
            </Text>
          </Flex>
        </Flex>
      ),
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
                {renderFieldError(cellKey)}
              </Flex>
            ) : (
              <Text type="secondary" style={{ fontSize: 12, textAlign: 'right' }}>
                So với Quảng cáo cửa hàng trong cộng tác mở {record.openCollaborationShopAdsRate ?? "--"}%{" "}
                {!isStoreLocked && (
                  <EditOutlined
                    style={{ fontSize: 12, cursor: 'pointer' }}
                    onClick={() => startEdit(cellKey, record.openCollaborationShopAdsRate)}
                  />
                )}
              </Text>
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
    
          <Upload {...uploadProps}>
            <Button loading={uploadLoading} type='primary' icon={<UploadOutlined />}>Tải file</Button>
          </Upload>
        </Flex>
        <Form.Item<IEditCampaignForm>>
          <Table
            dataSource={productTableData}
            columns={columns as any}
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
  </>
  )
}

export default SectionProductCommission
