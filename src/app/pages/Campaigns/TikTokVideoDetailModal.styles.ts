import styled from 'styled-components'
import {
    ActionCount,
    ActionIcon,
    AdTag,
    DescriptionText,
    ExpandButton,
    MusicInfo,
    OverlayLayer,
    PlayButtonOverlay,
    PlayerContainer,
    ProductBadge,
    ShopHeaderText,
    ShopProductTitle,
} from './TikTokVideoPlayer.styles'

export const DetailModalBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`

export const DetailModalLayout = styled.div`
    display: flex;
    gap: 24px;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
`

export const DetailPlayerFrame = styled.div`
    position: relative;
    flex-shrink: 0;
    width: min(400px, 100%);
    aspect-ratio: 56 / 100;
    max-height: min(85vh, 720px);
    margin: 0 auto;

    ${PlayerContainer} {
        border-radius: 12px;
        cursor: default;

        &:hover {
            transform: none;
            box-shadow: none;
            z-index: auto;
        }
    }

    ${OverlayLayer} {
        padding: 16px;
    }

    ${DescriptionText} {
        font-size: 14px;
        line-height: 1.5;
        -webkit-line-clamp: 4;
    }

    ${ExpandButton} {
        font-size: 12px;
    }

    ${MusicInfo} {
        font-size: 12px;
        margin-top: 10px;
    }

    ${ProductBadge} {
        font-size: 11px;
        padding: 2px 6px;
        margin-bottom: 8px;
    }

    ${ShopHeaderText} {
        font-size: 13px;
    }

    ${ShopProductTitle} {
        font-size: 11px;
    }

    ${ActionIcon} {
        font-size: 28px;
    }

    ${ActionCount} {
        font-size: 12px;
    }

    ${AdTag} {
        top: 12px;
        left: 12px;
        font-size: 13px;
        padding: 5px 14px;
    }

    ${PlayButtonOverlay} {
        display: none;
    }
`

export const DetailModalSide = styled.div`
    flex: 1;
    min-width: 220px;
    max-width: 100%;
`
