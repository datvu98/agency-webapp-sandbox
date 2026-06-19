import { useLazyQuery, useMutation } from '@apollo/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import mutate_affTriggerSingleVideoSyncByRefId from 'graphql/mutations/mutate_affTriggerSingleVideoSyncByRefId'
import query_affGetCreatorChannelVideos from 'graphql/queries/query_affGetCreatorChannelVideos'
import query_affGetVideoSyncProgress from 'graphql/queries/query_affGetVideoSyncProgress'
import { showAlert } from 'utils/helper'
import { ICreatorChannelVideo, ITikTokVideoSyncProgress } from '../types/KOCVideoChanel.types'

const PAGE_SIZE = 10
const POLL_INTERVAL_MS = 2000

const SYNC_STATUS = {
    PROCESSING: 'processing',
    COMPLETED: 'completed',
} as const

const mapSyncProgress = (
    raw?: {
        syncTaskId?: string | null
        status?: string | null
        percentage?: number | null
        completedCount?: number | null
        totalCount?: number | null
        failedCount?: number | null
        error?: string | null
        username?: string | null
    } | null,
    fallbackSyncTaskId?: string | null,
): ITikTokVideoSyncProgress | null => {
    if (!raw) return null

    const syncTaskId = raw.syncTaskId ?? fallbackSyncTaskId
    if (!syncTaskId) return null

    return {
        syncTaskId,
        status: raw.status ?? '',
        percentage: raw.percentage ?? 0,
        completedCount: raw.completedCount ?? 0,
        totalCount: raw.totalCount ?? 0,
        failedCount: raw.failedCount ?? 0,
        error: raw.error ?? null,
        username: raw.username ?? null,
    }
}

const parseMusic = (music: unknown): ICreatorChannelVideo['music'] => {
    if (!music) return undefined
    if (typeof music === 'object') return music as ICreatorChannelVideo['music']
    if (typeof music === 'string') {
        try {
            return JSON.parse(music) as ICreatorChannelVideo['music']
        } catch {
            return undefined
        }
    }
    return undefined
}

const mapVideoItem = (item: unknown): ICreatorChannelVideo => {
    const row = item as ICreatorChannelVideo
    return {
        ...row,
        music: parseMusic(row.music),
        hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
        products: Array.isArray(row.products) ? row.products : [],
    }
}

const isSyncProcessing = (progress: ITikTokVideoSyncProgress) =>
    (progress.status ?? '').toLowerCase() === SYNC_STATUS.PROCESSING

const isSyncTerminal = (progress: ITikTokVideoSyncProgress) => {
    const status = (progress.status ?? '').toLowerCase()
    if (status === SYNC_STATUS.COMPLETED) return true
    // if (['failed', 'error', 'cancelled'].includes(status)) return true
    if (progress.percentage >= 100) return true
    if (progress.totalCount > 0 && progress.completedCount >= progress.totalCount) return true
    return false
}

const hasSyncIssue = (progress: ITikTokVideoSyncProgress) =>
    Boolean(progress.error) || (progress.failedCount ?? 0) > 0

const shouldReloadVideosAfterSync = (progress: ITikTokVideoSyncProgress) => {
    const status = (progress.status ?? '').toLowerCase()
    if (status === SYNC_STATUS.COMPLETED) return true
    if (progress.percentage >= 100) return true
    if (
        progress.totalCount > 0 &&
        progress.completedCount >= progress.totalCount
    ) {
        return true
    }
    return false
}

type UseKocChannelVideosOptions = {
    onSyncComplete?: () => void | Promise<void>
}

export const useKocChannelVideos = (
    creatorId?: number,
    open = false,
    options?: UseKocChannelVideosOptions,
) => {
    const [videos, setVideos] = useState<ICreatorChannelVideo[]>([])
    const [pageNumber, setPageNumber] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [checkingSync, setCheckingSync] = useState(false)
    const [syncProgress, setSyncProgress] = useState<ITikTokVideoSyncProgress | null>(null)
    const [syncErrorSnapshot, setSyncErrorSnapshot] = useState<ITikTokVideoSyncProgress | null>(null)

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const syncTaskIdRef = useRef<string | null>(null)
    const showAlertOnCompleteRef = useRef(true)
    const onSyncCompleteRef = useRef(options?.onSyncComplete)
    onSyncCompleteRef.current = options?.onSyncComplete

    const [fetchVideos] = useLazyQuery(query_affGetCreatorChannelVideos, {
        fetchPolicy: 'network-only',
    })

    const [triggerSync, { loading: triggeringSync }] = useMutation(
        mutate_affTriggerSingleVideoSyncByRefId,
    )

    const [fetchSyncProgress] = useLazyQuery(query_affGetVideoSyncProgress, {
        fetchPolicy: 'network-only',
    })

    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
        }
    }, [])

    const resetSyncState = useCallback(() => {
        stopPolling()
        syncTaskIdRef.current = null
        setSyncProgress(null)
        setSyncErrorSnapshot(null)
        setSyncing(false)
    }, [stopPolling])

    const loadPage = useCallback(async (page: number) => {
        if (!creatorId) return

        setLoading(true)
        if (page === 1) setInitialLoading(true)

        try {
            const { data } = await fetchVideos({
                variables: {
                    input: {
                        filter: { creatorId },
                        pageNumber: page,
                        pageSize: PAGE_SIZE,
                    },
                },
            })

            const res = data?.affGetCreatorChannelVideos
            if (!res?.success) return

            const items = (res.data ?? []).map(mapVideoItem)
            const meta = res.meta

            setVideos((prev) => (page === 1 ? items : [...prev, ...items]))
            setHasMore(meta ? meta.pageNumber < meta.totalPages : items.length >= PAGE_SIZE)
            setPageNumber(page)
        } finally {
            setLoading(false)
            setInitialLoading(false)
        }
    }, [creatorId, fetchVideos])

    const handleSyncProgressResult = useCallback(async (
        progress: ITikTokVideoSyncProgress,
        options?: { errorMessage?: string; silentComplete?: boolean },
    ) => {
        setSyncProgress(progress)

        if (!isSyncTerminal(progress)) return false

        stopPolling()
        syncTaskIdRef.current = null
        setSyncing(false)

        const syncHasIssue = hasSyncIssue(progress)
        const shouldReload = shouldReloadVideosAfterSync(progress)

        if (syncHasIssue) {
            setSyncErrorSnapshot(progress)
        } else {
            setSyncErrorSnapshot(null)
        }

        if (shouldReload) {
            if (
                !syncHasIssue &&
                !options?.silentComplete &&
                showAlertOnCompleteRef.current
            ) {
                showAlert.success('Tải video thành công')
            }
            setVideos([])
            setPageNumber(1)
            setHasMore(true)
            await Promise.all([
                loadPage(1),
                onSyncCompleteRef.current?.(),
            ])
        } else if (!syncHasIssue) {
            showAlert.error(
                progress.error || options?.errorMessage || 'Tải video thất bại',
            )
        }

        return true
    }, [loadPage, stopPolling])

    const pollSyncProgress = useCallback(async () => {
        if (!creatorId) return

        const syncTaskId = syncTaskIdRef.current

        try {
            const { data, error } = await fetchSyncProgress({
                variables: {
                    creatorId,
                    ...(syncTaskId ? { syncTaskId } : {}),
                },
            })

            if (error) {
                resetSyncState()
                showAlert.error(error.message || 'Lỗi khi theo dõi tiến trình tải video')
                return
            }

            const res = data?.affGetVideoSyncProgressOfChannel
            if (!res?.success || !res.data) {
                resetSyncState()
                showAlert.error(res?.message || 'Lỗi khi theo dõi tiến trình tải video')
                return
            }

            const progress = mapSyncProgress(res.data, syncTaskId)
            if (!progress) {
                resetSyncState()
                return
            }

            if (progress.syncTaskId) {
                syncTaskIdRef.current = progress.syncTaskId
            }

            await handleSyncProgressResult(progress, { errorMessage: res.message })
        } catch (err: unknown) {
            resetSyncState()
            const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi theo dõi tiến trình tải video'
            showAlert.error(message)
        }
    }, [creatorId, fetchSyncProgress, handleSyncProgressResult, resetSyncState])

    const startPolling = useCallback((
        syncTaskId: string,
        options?: { showAlertOnComplete?: boolean },
    ) => {
        syncTaskIdRef.current = syncTaskId
        showAlertOnCompleteRef.current = options?.showAlertOnComplete !== false
        stopPolling()
        setSyncing(true)
        pollSyncProgress()
        pollIntervalRef.current = setInterval(pollSyncProgress, POLL_INTERVAL_MS)
    }, [pollSyncProgress, stopPolling])

    const checkOngoingSync = useCallback(async () => {
        if (!creatorId) return

        setCheckingSync(true)
        try {
            const { data, error } = await fetchSyncProgress({
                variables: { creatorId },
            })

            if (error) return

            const res = data?.affGetVideoSyncProgressOfChannel
            if (!res?.success || !res.data) return

            const progress = mapSyncProgress(res.data)
            if (!progress) return

            setSyncProgress(progress)

            if (isSyncProcessing(progress) || !isSyncTerminal(progress)) {
                startPolling(progress.syncTaskId)
                return
            }

            await handleSyncProgressResult(progress, { silentComplete: true })
        } catch {
            // Bỏ qua lỗi khi kiểm tra tiến trình lúc mở popup
        } finally {
            setCheckingSync(false)
        }
    }, [creatorId, fetchSyncProgress, handleSyncProgressResult, startPolling])

    const triggerVideoSync = useCallback(async () => {
        if (!creatorId || syncing || triggeringSync) return

        try {
            setSyncErrorSnapshot(null)

            const { data } = await triggerSync({
                variables: { creatorId },
            })

            const res = data?.affTriggerSingleVideoSyncByRefId
            if (!res?.success) {
                showAlert.error(res?.message || 'Không thể bắt đầu tải video')
                return
            }

            const syncTaskId = res.data?.syncTaskId
            if (!syncTaskId) {
                showAlert.error('Không nhận được mã tiến trình tải video')
                return
            }

            setSyncProgress({
                syncTaskId,
                status: res.data?.status ?? '',
                percentage: 0,
                completedCount: 0,
                totalCount: res.data?.totalCount ?? 0,
            })
            startPolling(syncTaskId)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Không thể bắt đầu tải video'
            showAlert.error(message)
        }
    }, [creatorId, syncing, triggeringSync, triggerSync, startPolling])

    const loadMore = useCallback(() => {
        if (loading || !hasMore || !creatorId) return
        loadPage(pageNumber + 1)
    }, [loading, hasMore, creatorId, pageNumber, loadPage])

    useEffect(() => {
        if (!open || !creatorId) {
            setVideos([])
            setPageNumber(1)
            setHasMore(true)
            setLoading(false)
            setInitialLoading(false)
            setCheckingSync(false)
            resetSyncState()
            return
        }

        setVideos([])
        setPageNumber(1)
        setHasMore(true)
        loadPage(1)
        checkOngoingSync()
    }, [open, creatorId])

    useEffect(() => () => stopPolling(), [stopPolling])

    return {
        videos,
        loading,
        initialLoading,
        hasMore,
        loadMore,
        syncing: syncing || triggeringSync || checkingSync,
        syncProgress,
        syncErrorSnapshot,
        triggerVideoSync,
    }
}
