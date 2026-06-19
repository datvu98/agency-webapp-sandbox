import { useLazyQuery, useMutation } from '@apollo/client'
import { useMemo, useState } from 'react'
import { REGISTER_SAMPLE_STATUS } from '../../CampaignRegister/constants/constant'
import mutate_affApproveCampaignSampleRequest from 'graphql/mutations/mutate_affApproveCampaignSampleRequest'
import mutate_affRejectCampaignSampleRequest from 'graphql/mutations/mutate_affRejectCampaignSampleRequest'
import query_affCheckCampaignSampleRequestItemsStock from 'graphql/queries/query_affCheckCampaignSampleRequestItemsStock'
import { showAlert } from 'utils/helper'

type CampaignSampleRequestItem = {
  id?: number
  status?: string
  productName?: string
  variantImage?: string
  variantSku?: string
  variantName?: string
  quantityPurchased?: number
}

type UseProductSampleActionsParams = {
  requestId?: number
  items?: CampaignSampleRequestItem[]
  onCompleted?: () => Promise<unknown> | void
}

export const useProductSampleActions = ({
  requestId,
  items,
  onCompleted,
}: UseProductSampleActionsParams) => {
  const [openApproveModal, setOpenApproveModal] = useState(false)
  const [openRejectModal, setOpenRejectModal] = useState(false)

  const [approveSampleRequest, { loading: approveLoading }] = useMutation(mutate_affApproveCampaignSampleRequest)
  const [rejectCampaignSampleRequest, { loading: rejectLoading }] = useMutation(mutate_affRejectCampaignSampleRequest)
  const [checkStockQuery] = useLazyQuery(query_affCheckCampaignSampleRequestItemsStock, {
    fetchPolicy: 'network-only',
  })

  const pendingItemIds = useMemo(
    () =>
      (items ?? [])
        .filter((item) => item?.status == REGISTER_SAMPLE_STATUS.pending)
        .map((item) => item?.id)
        .filter((id): id is number => typeof id === 'number'),
    [items]
  )

  const approveProducts = useMemo(
    () =>
      (items ?? []).map((item) => ({
        id: item?.id ?? 0,
        productName: item?.productName ?? '--',
        image: item?.variantImage ?? '',
        variantSku: item?.variantSku ?? '--',
        variantName: item?.variantName ?? '--',
        variantImage: item?.variantImage ?? '',
        quantityPurchased: item?.quantityPurchased ?? 0,
      })),
    [items]
  )

  const checkItemsStock = async (ids: number[]): Promise<number[]> => {
    const result = await checkStockQuery({ variables: { ids } })
    return result?.data?.affCheckCampaignSampleRequestItemsStock?.data?.errorItemIds ?? []
  }

  const handleApprove = async (remainingRequestItemIds: number[], shouldCheckStock?: number) => {
    if (!requestId) {
      showAlert.error('Không tìm thấy yêu cầu duyệt mẫu')
      return
    }
    const ids = (remainingRequestItemIds ?? []).filter((id) => typeof id === 'number')
    if (!ids.length) {
      showAlert.warn('Vui lòng chọn ít nhất 1 sản phẩm để duyệt')
      return
    }

    try {
      const response = await approveSampleRequest({
        variables: {
          id: requestId,
          request_item_ids: ids,
          ...(shouldCheckStock != null && { should_check_stock: shouldCheckStock }),
        },
      })

      const result = response?.data?.affApproveCampaignSampleRequest
      if (result?.success) {
        showAlert.success(result?.message || 'Duyệt thành công')
        setOpenApproveModal(false)
      } else {
        showAlert.error(result?.message || 'Duyệt thất bại')
      }
    } catch (e: any) {
      showAlert.error(e?.message || 'Duyệt thất bại')
    } finally {
      await onCompleted?.()
    }
  }

  const handleReject = async (rejectMessage: string) => {
    if (!requestId) {
      showAlert.error('Không tìm thấy yêu cầu từ chối')
      return
    }

    try {
      const response = await rejectCampaignSampleRequest({
        variables: {
          ids: [requestId],
          reject_message: rejectMessage,
        },
      })
      const result = response?.data?.affRejectCampaignSampleRequest
      if (result?.success) {
        showAlert.success(result?.message || 'Từ chối thành công')
        setOpenRejectModal(false)
      } else {
        showAlert.error(result?.message || 'Từ chối thất bại')
      }
    } catch (e: any) {
      showAlert.error(e?.message || 'Từ chối thất bại')
    } finally {
      await onCompleted?.()
    }
  }

  return {
    openApproveModal,
    openRejectModal,
    approveLoading,
    rejectLoading,
    pendingItemIds,
    approveProducts,
    setOpenApproveModal,
    setOpenRejectModal,
    checkItemsStock,
    handleApprove,
    handleReject,
  }
}

