import { LeftOutlined, RightOutlined, ShoppingOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import React, { useCallback, useRef } from 'react'
import {
    ShopHeaderBar,
    ShopHeaderIcon,
    ShopHeaderText,
    ShopProductCard,
    ShopProductImageLink,
    ShopProductList,
    ShopProductsBlock,
    ShopProductsWrap,
    ShopProductTitle,
    ShopScrollArrow,
    SHOP_PRODUCT_CARD_WIDTH,
    SHOP_PRODUCT_GAP,
} from '../TikTokVideoPlayer.styles'

export interface IVideoTikTokShopProduct {
    title?: string
    source?: string
    seo_url?: string
    img_url?: string[]
    cover_url?: string
}

export const normalizeVideoProducts = (raw: unknown): IVideoTikTokShopProduct[] => {
    if (!raw) return []
    let list: unknown = raw
    if (typeof raw === 'string') {
        try {
            list = JSON.parse(raw)
        } catch {
            return []
        }
    }
    if (!Array.isArray(list)) return []
    return list.filter((item) => item && (item.title || item.img_url?.length || item.cover_url))
}

const getProductImage = (product: IVideoTikTokShopProduct) =>
    product.img_url?.[0] || product.cover_url || ''

const getShopName = (products: IVideoTikTokShopProduct[]) =>
    products.find((p) => p.source)?.source || 'TikTok Shop'

interface TikTokVideoShopProductsProps {
    products: IVideoTikTokShopProduct[]
}

const TikTokVideoShopProducts = ({ products }: TikTokVideoShopProductsProps) => {
    const listRef = useRef<HTMLDivElement>(null)

    const scrollList = useCallback((direction: 'left' | 'right') => {
        const el = listRef.current
        if (!el) return
        const step = SHOP_PRODUCT_CARD_WIDTH + SHOP_PRODUCT_GAP
        el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' })
    }, [])

    const showArrows = products.length > 3

    if (products.length === 0) return null

    return (
        <ShopProductsBlock onClick={(e) => e.stopPropagation()}>
            <ShopProductsWrap>
                {showArrows && (
                    <ShopScrollArrow
                        type='button'
                        aria-label='Cuộn trái'
                        onClick={() => scrollList('left')}
                    >
                        <LeftOutlined style={{ fontSize: 10 }} />
                    </ShopScrollArrow>
                )}
                <ShopProductList ref={listRef} $scrollable={showArrows}>
                    {products.map((product, index) => {
                        const imageUrl = getProductImage(product)
                        const title = product.title || ''
                        const productUrl = product.seo_url

                        return (
                            <Tooltip
                                key={`${productUrl || title}-${index}`}
                                title={title}
                                placement='top'
                            >
                                <ShopProductCard>
                                    <ShopProductTitle>{title}</ShopProductTitle>
                                    {imageUrl && productUrl && (
                                        <ShopProductImageLink
                                            href={productUrl}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <img src={imageUrl} alt={title} />
                                        </ShopProductImageLink>
                                    )}
                                </ShopProductCard>
                            </Tooltip>
                        )
                    })}
                </ShopProductList>
                {showArrows && (
                    <ShopScrollArrow
                        type='button'
                        aria-label='Cuộn phải'
                        onClick={() => scrollList('right')}
                    >
                        <RightOutlined style={{ fontSize: 10 }} />
                    </ShopScrollArrow>
                )}
            </ShopProductsWrap>
        </ShopProductsBlock>
    )
}

export default TikTokVideoShopProducts
