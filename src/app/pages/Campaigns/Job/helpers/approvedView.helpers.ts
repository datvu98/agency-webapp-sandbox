import { css } from 'styled-components'
import { JobProductRef, JobSubmissionProductMediaRef, PreviousSubmissionProductMedia } from '../../types/CampaignJobDetail.type'

export type MediaPair = {
  jobProductId: number
  videoUrl?: string
  imageUrl?: string
  videoUrls?: string[]
  imageUrls?: string[]
}

type ProductMediaRef = JobSubmissionProductMediaRef | PreviousSubmissionProductMedia
export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  REJECTED: 'rejected',
  APPROVED: 'approved',
} as const

export const buildJobProductNameMap = (jobProducts?: JobProductRef[] | null) => {
  const map = new Map<number, string>()
  for (const item of jobProducts ?? []) {
    if (item?.id != null) {
      map.set(item.id, item.productName ?? '--')
    }
  }
  return map
}

export const groupProductMediaByJobProduct = (
  productMedia?: ProductMediaRef[] | null,
): MediaPair[] => {
  const map = new Map<number, { video?: string; image?: string; videos: string[]; images: string[] }>()

  for (const pm of productMedia ?? []) {
    const pid = pm.jobProductId
    if (pid == null) continue

    const url = pm.jobSubmissionMedia?.url ?? undefined
    const type = (pm.jobSubmissionMedia?.type ?? '').toLowerCase()
    const cur = map.get(pid) ?? { videos: [], images: [] }

    if (type === 'video' && url) {
      cur.video = cur.video ?? url
      if (!cur.videos.includes(url)) cur.videos.push(url)
    }
    if (type === 'image' && url) {
      cur.image = cur.image ?? url
      if (!cur.images.includes(url)) cur.images.push(url)
    }

    map.set(pid, cur)
  }

  return [...map.entries()].map(([jobProductId, urls]) => ({
    jobProductId,
    videoUrl: urls.video,
    imageUrl: urls.image,
    videoUrls: urls.videos,
    imageUrls: urls.images,
  }))
}

export const submissionStatusBadge = (
  status?: string | null,
  rejectedColor: 'default' | 'error' = 'default',
) => {
  const s = (status ?? '').toLowerCase()
  if (s === SUBMISSION_STATUS.PENDING) return { label: 'Chờ duyệt', color: 'gold' as const }
  if (s === SUBMISSION_STATUS.REJECTED) return { label: 'Từ chối', color: rejectedColor }
  if (s === SUBMISSION_STATUS.APPROVED) return { label: 'Đã duyệt', color: 'success' as const }
  return { label: status ?? '--', color: 'default' as const }
}

export type RejectReasonLine = {
  key: string
  label?: string
  content: string
}

export const buildRejectReasonLines = (reason?: string | null): RejectReasonLine[] => {
  const lines = (reason ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.map((line, idx) => {
    const separatorIdx = line.indexOf(':')
    if (separatorIdx < 0) {
      return {
        key: `${line}-${idx}`,
        content: line,
      }
    }

    const label = line.slice(0, separatorIdx).trim()
    const content = line.slice(separatorIdx + 1).trim() || '--'
    return {
      key: `${line}-${idx}`,
      label,
      content,
    }
  })
}
