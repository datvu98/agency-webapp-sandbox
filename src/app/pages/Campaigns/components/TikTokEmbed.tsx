import { LinkOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Spin, Typography } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import React from 'react'
import { useInView } from 'react-intersection-observer'

type TikTokEmbedProps = {
    html?: string
    url?: string
    autoPlay?: boolean
    style?: React.CSSProperties
}

const MOUNT_DELAY_MS = 250
const MAX_AUTO_RETRIES = 2
const RETRY_INTERVAL_MS = 3500

const extractVideoId = (value: string) => {
    const normalizedValue = value.trim()
    if (!normalizedValue) return ''

    const matchedByDataAttr = normalizedValue.match(/data-video-id=["'](\d+)["']/i)?.[1]
    if (matchedByDataAttr) return matchedByDataAttr

    const matchedByCanonicalUrl = normalizedValue.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i)?.[1]
    if (matchedByCanonicalUrl) return matchedByCanonicalUrl

    const matchedByEmbedUrl = normalizedValue.match(/tiktok\.com\/embed(?:\/v2)?\/(\d+)/i)?.[1]
    if (matchedByEmbedUrl) return matchedByEmbedUrl

    const matchedByPlayerUrl = normalizedValue.match(/tiktok\.com\/player\/v1\/(\d+)/i)?.[1]
    if (matchedByPlayerUrl) return matchedByPlayerUrl

    const matchedByQueryParam = normalizedValue.match(/[?&](?:video_id|item_id)=(\d+)/i)?.[1]
    if (matchedByQueryParam) return matchedByQueryParam

    return ''
}

const resolveFallbackLink = (value: string) => {
    const normalizedValue = value.trim()
    if (!normalizedValue) return ''
    if (/^https?:\/\//i.test(normalizedValue)) return normalizedValue
    return ''
}

const { Text } = Typography

const TikTokEmbed = ({
    html = '',
    url = '',
    style,
    autoPlay = true,
}: TikTokEmbedProps) => {
    const [oembedHtml, setOembedHtml] = useState('')
    const [oembedLoading, setOembedLoading] = useState(false)
    const [hasEmbedError, setHasEmbedError] = useState(false)
    const [mountGeneration, setMountGeneration] = useState(0)
    const [isDeferredReady, setIsDeferredReady] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const retryCountRef = useRef(0)
    const playerReadyRef = useRef(false)

    const sourceKey = `${html}::${url}`

    const { ref: containerRef, inView } = useInView({
        threshold: 0.05,
        rootMargin: '40px',
        triggerOnce: false,
    })

    useEffect(() => {
        setHasEmbedError(false)
        setIsDeferredReady(false)
        setMountGeneration((g) => g + 1)
        retryCountRef.current = 0
        playerReadyRef.current = false
    }, [sourceKey])

    useEffect(() => {
        let canceled = false

        const fetchOembed = async () => {
            if (!url || extractVideoId(url) || extractVideoId(html)) {
                setOembedHtml('')
                setOembedLoading(false)
                return
            }

            setOembedLoading(true)
            try {
                const response = await fetch(
                    `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
                )
                if (!response.ok) {
                    if (!canceled) setOembedHtml('')
                    return
                }

                const data = (await response.json()) as { html?: string }
                if (!canceled) {
                    setOembedHtml(data.html || '')
                }
            } catch {
                if (!canceled) setOembedHtml('')
            } finally {
                if (!canceled) setOembedLoading(false)
            }
        }

        void fetchOembed()

        return () => {
            canceled = true
        }
    }, [html, url])

    const videoId = useMemo(() => {
        return extractVideoId(html) || extractVideoId(url) || extractVideoId(oembedHtml)
    }, [html, oembedHtml, url])

    useEffect(() => {
        if (!videoId || oembedLoading) {
            setIsDeferredReady(false)
            return undefined
        }

        let timer: ReturnType<typeof setTimeout>
        const rafId = requestAnimationFrame(() => {
            timer = setTimeout(() => setIsDeferredReady(true), MOUNT_DELAY_MS)
        })

        return () => {
            cancelAnimationFrame(rafId)
            clearTimeout(timer)
            setIsDeferredReady(false)
        }
    }, [videoId, oembedLoading, mountGeneration])

    const shouldMountIframe = Boolean(
        videoId && !hasEmbedError && isDeferredReady && inView && !oembedLoading,
    )

    const embedSrc = useMemo(() => {
        if (!videoId || !shouldMountIframe) return ''

        const params = new URLSearchParams({
            autoplay: autoPlay ? '1' : '0',
            muted: '0',
            controls: '1',
            play_button: '1',
            progress_bar: '1',
            volume_control: '1',
            music_info: '0',
            description: '0',
            rel: '0',
            native_context_menu: '1',
            loop: '0',
        })

        return `https://www.tiktok.com/player/v1/${videoId}?${params.toString()}`
    }, [autoPlay, shouldMountIframe, videoId])

    const fallbackLink = useMemo(() => {
        return resolveFallbackLink(url) || resolveFallbackLink(html)
    }, [html, url])

    const postToPlayer = useCallback((type: string, value?: number) => {
        const iframeWindow = iframeRef.current?.contentWindow
        if (!iframeWindow) return

        iframeWindow.postMessage(
            { type, ...(value != null ? { value } : {}), 'x-tiktok-player': true },
            '*',
        )
    }, [])

    useEffect(() => {
        if (!shouldMountIframe || !videoId) return undefined

        playerReadyRef.current = false

        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow) return

            const data = event.data
            if (!data?.['x-tiktok-player']) return
            if (data.type === 'onPlayerReady') {
                playerReadyRef.current = true
                if (autoPlay) postToPlayer('play')
            }
        }

        window.addEventListener('message', handleMessage)
        const fallbackTimer = window.setTimeout(() => {
            if (autoPlay) postToPlayer('play')
        }, 800)

        return () => {
            window.removeEventListener('message', handleMessage)
            window.clearTimeout(fallbackTimer)
        }
    }, [autoPlay, postToPlayer, shouldMountIframe, videoId, mountGeneration])

    useEffect(() => {
        if (!shouldMountIframe || !videoId) return undefined

        const retryTimer = window.setTimeout(() => {
            if (playerReadyRef.current) return
            if (retryCountRef.current >= MAX_AUTO_RETRIES) return

            retryCountRef.current += 1
            playerReadyRef.current = false
            setMountGeneration((g) => g + 1)
        }, RETRY_INTERVAL_MS)

        return () => window.clearTimeout(retryTimer)
    }, [shouldMountIframe, videoId, mountGeneration])

    const handleIframeLoad = useCallback(() => {
        if (autoPlay) {
            postToPlayer('play')
        }
    }, [autoPlay, postToPlayer])

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        minHeight: 120,
        position: 'relative',
        ...style,
    }

    if (!videoId || hasEmbedError) {
        if (!fallbackLink) return null

        return (
            <Flex
                vertical
                align="center"
                justify="center"
                gap={8}
                style={{
                    ...containerStyle,
                    padding: 12,
                    background: '#000',
                    borderRadius: 6,
                }}
            >
                <PlayCircleOutlined style={{ color: '#fff', fontSize: 28 }} />
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12 }}>
                    Không thể tải video trực tiếp
                </Text>
                <Button
                    type="link"
                    href={fallbackLink}
                    target="_blank"
                    style={{ padding: 0, height: 'fit-content' }}
                    icon={<LinkOutlined />}
                >
                    Mở trên TikTok
                </Button>
            </Flex>
        )
    }

    return (
        <div ref={containerRef} style={containerStyle}>
            {shouldMountIframe && embedSrc ? (
                <iframe
                    ref={iframeRef}
                    key={`${videoId}-${mountGeneration}`}
                    title={`TikTok video ${videoId}`}
                    src={embedSrc}
                    style={{ width: '100%', height: '100%', borderRadius: 6, border: 'none', display: 'block' }}
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    onLoad={handleIframeLoad}
                    onError={() => setHasEmbedError(true)}
                />
            ) : (
                <Flex
                    align="center"
                    justify="center"
                    style={{
                        width: '100%',
                        height: '100%',
                        minHeight: 'inherit',
                        background: '#000',
                        borderRadius: 6,
                    }}
                >
                    <Spin size="small" />
                </Flex>
            )}
        </div>
    )
}

export default TikTokEmbed
