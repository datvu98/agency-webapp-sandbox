import type { ReviewFeedback } from '../../components/GuidedReviewForm'

export const sortAssetsByIndexAsc = (assets: any[] = []) =>
  [...assets].sort((a, b) => {
    const indexA = Number(a?.index)
    const indexB = Number(b?.index)
    const safeA = Number.isFinite(indexA) ? indexA : Number.MAX_SAFE_INTEGER
    const safeB = Number.isFinite(indexB) ? indexB : Number.MAX_SAFE_INTEGER
    return safeA - safeB
  })

export const getAssetKey = (asset: any, idx: number) =>
  String(asset?.id ?? `${asset?.type ?? 'asset'}-${asset?.index ?? idx}-${idx}`)

export const splitMediaUrlsByType = (productMedia: any[] = []) => {
  const medias = productMedia
    .map((pm) => pm?.jobSubmissionMedia)
    .filter(Boolean)

  const imageUrls = Array.from(
    new Set(
      medias
        .filter((media: any) => (media?.type ?? '').toLowerCase() === 'image' && media?.url)
        .map((media: any) => media.url),
    ),
  ) as string[]

  const linkUrls = Array.from(
    new Set(
      medias
        .filter((media: any) => (media?.type ?? '').toLowerCase() === 'link' && media?.url)
        .map((media: any) => media.url),
    ),
  ) as string[]

  return { imageUrls, linkUrls }
}

export const buildRejectReasonFromFeedback = (feedback?: ReviewFeedback) => {
  if (!feedback) return ''
  const keyLabelMap: Record<keyof ReviewFeedback, string> = {
    hook: 'Hook',
    script: 'Kịch bản',
    visual: 'Hình ảnh',
    other: 'Khác',
  }
  return (Object.keys(keyLabelMap) as (keyof ReviewFeedback)[])
    .map((key) => `${keyLabelMap[key]}: ${feedback[key]?.trim() ?? ''}`)
    .join('\n')
    .trim()
}

const REJECT_REASON_LINE_SEPARATOR = '\n'

export const buildRejectedAssetsReasonForApprovedAir = (feedback?: ReviewFeedback) =>
  [feedback?.script ?? '', feedback?.other ?? '']
    .flatMap((content) => content.split(REJECT_REASON_LINE_SEPARATOR))
    .map((line) => line.trim())
    .filter(Boolean)
    .join(REJECT_REASON_LINE_SEPARATOR)
