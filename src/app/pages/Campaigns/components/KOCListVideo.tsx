import { Avatar, Button, Divider, Flex, Grid, Modal, Popover, Progress, Spin, Tooltip, Typography } from 'antd'
import React, { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useKocChannelVideos } from '../CampaignRegister/hooks/useKocChannelVideos'
import { useKocCreatorInfo } from '../CampaignRegister/hooks/useKocCreatorInfo'
import { KocVideoScrollArea, VideoGrid, VideoGridCell } from '../Campaign.styles'
import TikTokVideoPlayer from './TikTokVideoPlayer'
import { ICreatorChannelVideo, ICreatorInfoResponse, ITikTokVideoSyncProgress } from '../CampaignRegister/types/KOCVideoChanel.types'
import { CheckCircleOutlined, ExportOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text } = Typography

const MODAL_WIDTH_MAP = { xs: '100vw', sm: '100vw', md: '100vw', lg: '90vw', xl: '80vw', xxl: '82vw' } as const

const StatPill = ({ value, label }: { value: number; label: string }) => (
    <Flex gap={4} align='baseline'>
        <Text strong style={{ fontSize: 14, color: '#111' }}>{value.toLocaleString('vi-VN')}</Text>
        <Text style={{ fontSize: 12 }}>{label}</Text>
    </Flex>
)



const SyncResultPopoverContent = ({ progress }: { progress: ITikTokVideoSyncProgress }) => {
    const friendModeCount = Math.max(
        0,
        progress.totalCount - progress.completedCount - (progress.failedCount ?? 0),
    )

    return (
        <Flex vertical gap={6} style={{ maxWidth: 280 }}>
            <Text>Số video tải thành công: {progress.completedCount}</Text>
            <Text>Số video ở chế độ bạn bè: {friendModeCount}</Text>
            <Text>Số video tải thất bại: {progress.failedCount ?? 0}</Text>
            {progress.error && (
                <Text style={{ whiteSpace: 'pre-wrap' }}>{progress.error}</Text>
            )}
        </Flex>
    )
}

const resolveSyncResult = (
    syncErrorSnapshot: ITikTokVideoSyncProgress | null,
    syncProgress: ITikTokVideoSyncProgress | null,
) => {
    if (syncErrorSnapshot) {
        return { kind: 'error' as const, progress: syncErrorSnapshot }
    }

    const isCompletedSuccess =
        syncProgress?.status?.toLowerCase() === 'completed' &&
        (syncProgress.failedCount ?? 0) === 0 &&
        !syncProgress.error

    if (isCompletedSuccess) {
        return { kind: 'success' as const, progress: syncProgress }
    }

    return null
}

const SyncResultIcon = ({
    kind,
    progress,
}: {
    kind: 'error' | 'success'
    progress: ITikTokVideoSyncProgress
}) => {
    const isError = kind === 'error'
    const Icon = isError ? WarningOutlined : CheckCircleOutlined

    return (
        <Popover
            trigger='hover'
            placement='bottomRight'
            content={<SyncResultPopoverContent progress={progress} />}
        >
            <Icon
                style={{
                    fontSize: 14,
                    color: isError ? '#e74c3c' : '#2ecc71',
                    cursor: 'pointer',
                }}
            />
        </Popover>
    )
}

const KocHeader = ({
    creatorInfo,
    syncing,
    syncProgress,
    syncErrorSnapshot,
    onSyncVideos,
}: {
    creatorInfo: ICreatorInfoResponse
    syncing: boolean
    syncProgress: ITikTokVideoSyncProgress | null
    syncErrorSnapshot: ITikTokVideoSyncProgress | null
    onSyncVideos: () => void
}) => {
    const info = creatorInfo.data
    if (!info) return null

    const syncResult = resolveSyncResult(syncErrorSnapshot, syncProgress)

    return (
        <Flex align='center' justify='space-between' style={{ paddingBottom: 12, borderBottom: '1px solid #f0f0f0', marginTop: 12 }}>
            <Flex align='center' gap={14} >
                <span style={{ flexShrink: 0 }}><Avatar size={52} src={info.avatarThumb} /></span>
                <Flex vertical gap={1} style={{ minWidth: 0 }}>
                    <Flex align='center' gap={8}>
                        <Text strong style={{ fontSize: 17 }}>{info.nickname}</Text>
                        <Divider type='vertical' />
                        {info.uniqueId && (
                            <Flex align='center' gap={4}>
                                <Text
                                    type='secondary'
                                    style={{ fontSize: 13, cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://www.tiktok.com/@${info.uniqueId}`, '_blank', 'noopener,noreferrer');
                                    }}
                                >
                                    @{info.uniqueId}
                                </Text>
                                <ExportOutlined style={{ fontSize: 13, cursor: 'pointer', color: '#006aff' }} onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`https://www.tiktok.com/@${info.uniqueId}`, '_blank', 'noopener,noreferrer');
                                }} />
                            </Flex>
                        )}
                    </Flex>
                    <Flex wrap='wrap' gap={16} style={{ marginTop: 4 }}>
                        <StatPill value={info.followingCount} label='Đã follow' />
                        <StatPill value={info.followerCount} label='Follower' />
                        <StatPill value={info.heartCount} label='Lượt thích' />
                        <StatPill value={info.videoCount} label='video trên kênh' />
                        <Tooltip title='Vui lòng tải video để dữ liệu được cập nhật ở thời điểm gần nhất'>
                            <InfoCircleOutlined />
                        </Tooltip>
                    </Flex>
                </Flex>
            </Flex>
            <Flex vertical gap={6} align='flex-end' style={{ flexShrink: 0, maxWidth: 220 }}>
                <Button type='primary' loading={syncing} onClick={onSyncVideos}>
                    Tải video
                </Button>
                {!syncing && (
                    <Flex align='center' gap={4}>
                        <Text type='secondary' style={{ fontSize: 11 }}>
                            Cập nhật gần nhất: {dayjs(info?.updatedAt).format('HH:mm DD/MM/YYYY')}
                        </Text>
                        {syncResult && (
                            <SyncResultIcon
                                kind={syncResult.kind}
                                progress={syncResult.progress}
                            />
                        )}
                    </Flex>
                )}

                {syncing && syncProgress && (
                    <Flex vertical gap={2} style={{ width: 200 }}>
                        <Progress
                            percent={Math.round(syncProgress.percentage)}
                            size='small'
                            status={syncProgress.error ? 'exception' : 'active'}
                        />
                        <Text type='secondary' style={{ fontSize: 11, textAlign: 'right' }}>
                            {syncProgress.totalCount > 0 ? `${syncProgress.completedCount}/${syncProgress.totalCount}` : '—'}
                            {(syncProgress.failedCount ?? 0) > 0
                                ? ` · Lỗi: ${syncProgress.failedCount}`
                                : ''}
                        </Text>
                    </Flex>
                )}
            </Flex>
        </Flex>
    )
}

interface KOCListVideoProps {
    open: boolean
    onCancel: () => void
    creatorId?: number
}

const VideoCard = ({ video }: { video: ICreatorChannelVideo }) => (
    <VideoGridCell>
        <TikTokVideoPlayer
            video={video}
            showOverlay
            expandableDescription
            style={{ width: '100%', height: '100%' }}
        />
    </VideoGridCell>
)

const KOCListVideo = ({
    open,
    onCancel,
    creatorId,
}: KOCListVideoProps) => {
    const [scrollRoot, setScrollRoot] = React.useState<HTMLDivElement | null>(null)
    const screens = Grid.useBreakpoint()

    const {
        creatorInfo,
        loading: creatorInfoLoading,
        refetchCreatorInfo,
    } = useKocCreatorInfo(creatorId, open)
    const {
        videos,
        loading,
        initialLoading,
        hasMore,
        loadMore,
        syncing,
        syncProgress,
        syncErrorSnapshot,
        triggerVideoSync,
    } = useKocChannelVideos(creatorId, open, {
        onSyncComplete: refetchCreatorInfo,
    })

    const { ref: loadMoreRef, inView } = useInView({
        root: scrollRoot,
        rootMargin: '80px',
        threshold: 0,
    })

    useEffect(() => {
        if (inView && open && hasMore && !loading) {
            loadMore()
        }
    }, [inView, open, hasMore, loading, loadMore])

    const modalWidth = (() => {
        if (screens.xxl) return MODAL_WIDTH_MAP.xxl
        if (screens.xl) return MODAL_WIDTH_MAP.xl
        if (screens.lg) return MODAL_WIDTH_MAP.lg
        if (screens.md) return MODAL_WIDTH_MAP.md
        if (screens.sm) return MODAL_WIDTH_MAP.sm
        return MODAL_WIDTH_MAP.xs
    })()

    return (
        <>
            <Modal
                open={open}
                onCancel={onCancel}
                width={modalWidth}
                footer={null}
                centered
                destroyOnClose
                styles={{ body: { padding: '12px 0 0' } }}
            >
                <Flex vertical gap={12}>
                    {creatorInfoLoading ? (
                        <Flex justify='center' style={{ padding: '16px 0' }}>
                            <Spin />
                        </Flex>
                    ) : creatorInfo?.data ? (
                        <KocHeader
                            creatorInfo={creatorInfo}
                            syncing={syncing}
                            syncProgress={syncProgress}
                            syncErrorSnapshot={syncErrorSnapshot}
                            onSyncVideos={triggerVideoSync}
                        />
                    ) : null}

                    <KocVideoScrollArea ref={setScrollRoot}>
                        {initialLoading ? (
                            <Flex justify='center' style={{ padding: '48px 0' }}>
                                <Spin />
                            </Flex>
                        ) : videos.length > 0 ? (
                            <>
                                <VideoGrid>
                                    {videos.map((v) => (
                                        <VideoCard key={v.id} video={v} />
                                    ))}
                                </VideoGrid>
                                {hasMore && <div ref={loadMoreRef} style={{ height: 1 }} />}
                                {loading && !initialLoading && (
                                    <Flex justify='center' style={{ padding: '12px 0' }}>
                                        <Spin size='small' />
                                    </Flex>
                                )}
                            </>
                        ) : (
                            <Text type='secondary' style={{ display: 'block', textAlign: 'center', padding: '32px 0' }}>
                                Không có video nào
                            </Text>
                        )}
                    </KocVideoScrollArea>
                </Flex>
            </Modal>
        </>
    )
}

export default KOCListVideo
