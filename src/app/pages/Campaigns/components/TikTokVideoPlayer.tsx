// TikTokVideoPlayer.tsx
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    HeartOutlined,
    MessageOutlined,
    PlayCircleFilled,
    SoundOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';

import {
    PlayerContainer,
    ThumbnailImage,
    ThumbnailLayer,
    StyledIframe,
    OverlayLayer,
    BottomSection,
    InfoSection,
    ProductBadge,
    DescriptionText,
    ExpandButton,
    MusicInfo,
    ActionBar,
    ActionButton,
    ActionIcon,
    ActionCount,
    PlayButtonOverlay,
    AdTag,
} from '../TikTokVideoPlayer.styles';
import TikTokVideoShopProducts, { normalizeVideoProducts } from './TikTokVideoShopProducts';
import { ICreatorChannelVideo } from '../CampaignRegister/types/KOCVideoChanel.types';

export interface TikTokVideoPlayerProps {
  /** Thông tin video đầy đủ */
  video: ICreatorChannelVideo;
  /** Bật player ngay (vd. popup detail). Mặc định phải bấm nút play thủ công */
  isActive?: boolean;
  /** Chế độ tự động phát */
  autoPlay?: boolean;
  /** Hiển thị lớp phủ thông tin */
  showOverlay?: boolean;
  /** Cho phép mở rộng mô tả */
  expandableDescription?: boolean;
  /** Callback khi click vào video (thay vì mở link) */
  onClick?: () => void;
  /** @deprecated Luôn hiển thị sản phẩm khi video có dữ liệu — giữ prop để tương thích */
  showShopProducts?: boolean;
  /** Class name tùy chỉnh */
  className?: string;
  /** Style tùy chỉnh */
  style?: React.CSSProperties;
  /** Tùy chỉnh render overlay */
  renderOverlay?: (video: ICreatorChannelVideo, expanded: boolean, setExpanded: (expanded: boolean) => void) => React.ReactNode;
}

const { Text } = Typography;

const DESCRIPTION_CHAR_LIMIT = {
    wide: 80,
    narrow: 50,
} as const;

/** Card rộng (popup detail) dùng 80; card grid hẹp (kể cả laptop 16") dùng 50 */
const WIDE_CARD_MIN_WIDTH = 260;

const formatCount = (count: number): string => {
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
        return `${(count / 1_000).toFixed(1)}K`;
    }
    return String(count);
};

// Extract video ID từ URL TikTok
const extractVideoId = (url: string): string => {
    const patterns = [
        /tiktok\.com\/@[^/]+\/video\/(\d+)/i,
        /tiktok\.com\/embed(?:\/v2)?\/(\d+)/i,
        /tiktok\.com\/player\/v1\/(\d+)/i,
        /[?&](?:video_id|item_id)=(\d+)/i,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return '';
};

// Icons
const BookmarkIcon = () => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
        <path d="M6.00977 2C4.91431 2 4.00977 2.9026 4.00977 3.99805L4 22L12 19L20 22V20.5566V4C20 2.90694 19.0931 2 18 2H6.00977ZM6.00977 4H18V19.1133L12 16.8633L6.00195 19.1133L6.00977 4Z" />
    </svg>
);

const ShareIcon = () => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none">
        <path
            d="M20 12L13.6 5V8.5C10.4 8.5 4 10.6 4 19C4 17.833 5.92 15.5 13.6 15.5V19L20 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ShoppingIcon = () => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none">
        <rect width="24" height="24" rx="4" fill="#FFCC00" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.00006 8C9.00006 7.20435 9.31613 6.44129 9.87874 5.87868C10.4413 5.31607 11.2044 5 12.0001 5C12.7957 5 13.5588 5.31607 14.1214 5.87868C14.684 6.44129 15.0001 7.20435 15.0001 8H9.00006ZM7.00006 8C7.00006 6.67392 7.52684 5.40215 8.46452 4.46447C9.40221 3.52678 10.674 3 12.0001 3C13.3261 3 14.5979 3.52678 15.5356 4.46447C16.4733 5.40215 17.0001 6.67392 17.0001 8H20.0001C20.139 7.99999 20.2764 8.02893 20.4035 8.08496C20.5306 8.14099 20.6446 8.22289 20.7383 8.32544C20.832 8.42799 20.9034 8.54894 20.9477 8.68058C20.9921 8.81221 21.0086 8.95165 20.9961 9.09L20.1611 18.272C20.0932 19.0174 19.7492 19.7105 19.1965 20.2152C18.6439 20.7199 17.9225 20.9998 17.1741 21H6.82606C6.07761 20.9998 5.35625 20.7199 4.8036 20.2152C4.25094 19.7105 3.90692 19.0174 3.83906 18.272L3.00406 9.09C2.99156 8.95165 3.00802 8.81221 3.05239 8.68058C3.09676 8.54894 3.16807 8.42799 3.26178 8.32544C3.35548 8.22289 3.46953 8.14099 3.59664 8.08496C3.72375 8.02893 3.86114 7.99999 4.00006 8H7.00006Z"
            fill="white"
        />
    </svg>
);

const TikTokVideoPlayer: React.FC<TikTokVideoPlayerProps> = ({
    video,
    isActive = false,
    autoPlay = true,
    showOverlay = true,
    expandableDescription = true,
    onClick,
    showShopProducts = false,
    className,
    style,
    renderOverlay,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [embedError, setEmbedError] = useState(false);
    const [charLimit, setCharLimit] = useState<number>(DESCRIPTION_CHAR_LIMIT.narrow);
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const videoId = useMemo(() => extractVideoId(video.videoUrl), [video.videoUrl]);
    const isPlayerActive = isActive || isPlaying;
    const shouldAutoStart = isPlaying || (isActive && autoPlay);

    useEffect(() => {
        setIsPlaying(false);
        setEmbedError(false);
    }, [video.id, video.videoUrl]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return undefined;

        const updateCharLimit = () => {
            setCharLimit(
                el.clientWidth >= WIDE_CARD_MIN_WIDTH
                    ? DESCRIPTION_CHAR_LIMIT.wide
                    : DESCRIPTION_CHAR_LIMIT.narrow,
            );
        };

        updateCharLimit();
        const observer = new ResizeObserver(updateCharLimit);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const embedSrc = useMemo(() => {
        if (!videoId || !isPlayerActive) return '';

        const params = new URLSearchParams({
            autoplay: shouldAutoStart ? '1' : '0',
            muted: '0',
            controls: '1',
            play_button: '1',
            progress_bar: '1',
            volume_control: '1',
            fullscreen_button: '1',
            timestamp: '0',
            music_info: '1',
            description: '1',
            rel: '0',
            closed_caption: '0',
            native_context_menu: '1',
            loop: '0',
        });

        return `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`;
    }, [videoId, isPlayerActive, shouldAutoStart]);

    const postToPlayer = useCallback((type: string, value?: number) => {
        const iframeWindow = iframeRef.current?.contentWindow;
        if (!iframeWindow) return;

        iframeWindow.postMessage(
            { type, ...(value != null ? { value } : {}), 'x-tiktok-player': true },
            '*',
        );
    }, []);

    useEffect(() => {
        if (!isPlayerActive || !videoId || !shouldAutoStart) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow) return;

            const data = event.data;
            if (!data?.['x-tiktok-player']) return;
            if (data.type === 'onPlayerReady') {
                postToPlayer('play');
            }
        };

        window.addEventListener('message', handleMessage);
        const fallbackTimer = window.setTimeout(() => {
            postToPlayer('play');
        }, 800);

        return () => {
            window.removeEventListener('message', handleMessage);
            window.clearTimeout(fallbackTimer);
        };
    }, [isPlayerActive, shouldAutoStart, videoId, postToPlayer]);

    const handleMouseLeave = useCallback(() => {
        setIsExpanded(false);
    }, []);

    const handlePlayClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPlaying(true);
    }, []);

    const handleOpenOnTikTok = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (video.videoUrl) {
            window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
        }
    }, [video.videoUrl]);

    // Xây dựng nội dung mô tả + hashtag
    const fullText = useMemo(() => {
        const parts: string[] = [];
        if (video.desc) parts.push(video.desc);
        return parts.join('\n');
    }, [video.desc, video.hashtags]);

    const needsExpand = useMemo(
        () => fullText.length > charLimit || fullText.includes('\n'),
        [fullText, charLimit],
    );
    const musicLabel = useMemo(() => {
        if (!video.music) return null;
        const label = [video.music.authorName, video.music.title].filter(Boolean).join(' - ');
        return label || null;
    }, [video.music]);
    const firstProduct = video.products?.[0];
    const shopProducts = useMemo(
        () => normalizeVideoProducts(video.products),
        [video.products],
    );

    // const adTagNode = video.isAd ? <AdTag>Ad</AdTag> : null;

    const handleContainerClick = useCallback((e: React.MouseEvent) => {
        if (!onClick) return
        e.stopPropagation()
        onClick()
    }, [onClick])

    const handleCardClick = useCallback(
        (e: React.MouseEvent) => {
            if (isPlayerActive) return
            if (onClick) {
                handleContainerClick(e)
                return
            }
            handlePlayClick(e)
        },
        [isPlayerActive, onClick, handleContainerClick, handlePlayClick],
    )

    // Render overlay mặc định
    const defaultOverlay = (
        <>
            <BottomSection>
                <InfoSection>
                    {/* Badge SP — chỉ danh sách; popup detail dùng layout giỏ hàng bên dưới */}
                    {firstProduct && (
                        <ProductBadge>
                            <ShoppingIcon />
                            <Text style={{ color: '#fff', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {firstProduct?.elastic_title ?? 'Sản phẩm'}
                            </Text>
                        </ProductBadge>
                    )}

                    {shopProducts.length > 0 && (
                        <TikTokVideoShopProducts products={shopProducts} />
                    )}

                    {/* Description + hashtags */}
                    <DescriptionText $expanded={isExpanded}>
                        {isExpanded ? fullText : fullText.replace(/\n/g, ' ')}
                    </DescriptionText>

                    {/* Expand button */}
                    {expandableDescription && needsExpand && !isExpanded && (
                        <ExpandButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(true); }}>
                            ... Xem thêm
                        </ExpandButton>
                    )}
                    {expandableDescription && isExpanded && (
                        <ExpandButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(false); }}>
                            Thu gọn
                        </ExpandButton>
                    )}

                    {/* Music info */}
                    {musicLabel && (
                        <MusicInfo>
                            <SoundOutlined style={{ fontSize: 12, flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {musicLabel}
                            </span>
                        </MusicInfo>
                    )}
                </InfoSection>

                {/* Action buttons */}
                <ActionBar>
                    <ActionButton onClick={handleOpenOnTikTok} role='link' aria-label='Xem trên TikTok'>
                        <ActionIcon><HeartOutlined /></ActionIcon>
                        <ActionCount>{formatCount(video.diggCount)}</ActionCount>
                    </ActionButton>

                    <ActionButton onClick={handleOpenOnTikTok} role='link' aria-label='Xem trên TikTok'>
                        <ActionIcon><MessageOutlined /></ActionIcon>
                        <ActionCount>{formatCount(video.commentCount)}</ActionCount>
                    </ActionButton>

                    <ActionButton onClick={handleOpenOnTikTok} role='link' aria-label='Xem trên TikTok'>
                        <ActionIcon><BookmarkIcon /></ActionIcon>
                        <ActionCount>{formatCount(video.collectCount)}</ActionCount>
                    </ActionButton>

                    <ActionButton onClick={handleOpenOnTikTok} role='link' aria-label='Xem trên TikTok'>
                        <ActionIcon><ShareIcon /></ActionIcon>
                        <ActionCount>{formatCount(video.shareCount)}</ActionCount>
                    </ActionButton>
                </ActionBar>
            </BottomSection>
        </>
    );

    // Fallback khi không có video ID hoặc lỗi embed
    if (!videoId || embedError) {
        return (
            <PlayerContainer
                ref={containerRef}
                className={className}
                style={style}
                $isHovered={isPlayerActive}
                onClick={handleCardClick}
            >
                <ThumbnailLayer $hidden={false}>
                    <ThumbnailImage
                        src={video.coverUrl ?? video.dynamicCoverUrl ?? ''}
                        alt={video.title ?? 'TikTok video'}
                    />
                    <OverlayLayer $visible={showOverlay}>
                        {renderOverlay ? renderOverlay(video, isExpanded, setIsExpanded) : defaultOverlay}
                    </OverlayLayer>
                </ThumbnailLayer>
            </PlayerContainer>
        );
    }

    return (
        <PlayerContainer
            ref={containerRef}
            className={className}
            style={style}
            $isHovered={isPlayerActive}
            onMouseLeave={handleMouseLeave}
            onClick={handleCardClick}
        >
            {/* {adTagNode} */}

            {/* Lớp thumbnail + thông tin video — ẩn khi đang phát */}
            <ThumbnailLayer $hidden={isPlayerActive}>
                <ThumbnailImage
                    src={video.coverUrl ?? video.dynamicCoverUrl ?? ''}
                    alt={video.title ?? 'TikTok video'}
                />
                {showOverlay && (
                    <OverlayLayer $visible={true}>
                        {renderOverlay ? renderOverlay(video, isExpanded, setIsExpanded) : defaultOverlay}
                    </OverlayLayer>
                )}
                <PlayButtonOverlay
                    type="button"
                    $show={!isPlayerActive}
                    aria-label="Phát video"
                    onClick={handlePlayClick}
                >
                    <PlayCircleFilled style={{ fontSize: 36, color: '#fff' }} />
                </PlayButtonOverlay>
            </ThumbnailLayer>

            {isPlayerActive && !embedError && embedSrc && (
                <StyledIframe
                    ref={iframeRef}
                    $isActive={isPlayerActive}
                    key={videoId}
                    title={`TikTok video ${videoId}`}
                    src={embedSrc}
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                        if (shouldAutoStart) {
                            postToPlayer('play');
                        }
                    }}
                    onError={() => setEmbedError(true)}
                />
            )}
        </PlayerContainer>
    );
};

export default TikTokVideoPlayer;