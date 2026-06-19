// TikTokVideoPlayer.styles.ts
import styled, { keyframes } from 'styled-components';
import { Flex } from 'antd';

export const slideDown = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

export const PlayerContainer = styled.div<{ $isHovered?: boolean }>`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    background: #000;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        z-index: 10;
    }
`;

export const ThumbnailLayer = styled.div<{ $hidden?: boolean }>`
    position: absolute;
    inset: 0;
    z-index: ${({ $hidden }) => ($hidden ? 1 : 2)};
    transition: opacity 0.3s ease;
    opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
    pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'auto')};
`;

export const ThumbnailImage = styled.img`
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    object-position: center;
`;

export const StyledIframe = styled.iframe<{ $isActive?: boolean }>`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
    z-index: ${({ $isActive }) => ($isActive ? 3 : 1)};
    pointer-events: ${({ $isActive }) => ($isActive ? 'auto' : 'none')};
    animation: ${slideDown} 0.3s ease;
`;

export const OverlayLayer = styled.div<{ $visible?: boolean }>`
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.85) 5%,
        rgba(0, 0, 0, 0.4) 40%,
        rgba(0, 0, 0, 0.15) 70%,
        transparent 100%
    );
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 12px;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transition: opacity 0.2s ease;
    /* Chỉ vùng nội dung (BottomSection) nhận pointer events, phần gradient trong suốt */
    pointer-events: none;
    z-index: 3;
`;

export const BottomSection = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    pointer-events: auto;
`;

export const InfoSection = styled.div`
    flex: 1;
    min-width: 0;
`;

export const ProductBadge = styled(Flex)`
    align-items: center;
    gap: 4px;
    margin-bottom: 6px;
    padding: 1px 3px;
    border-radius: 4px;
    background: rgba(73, 73, 73, 0.85);
    backdrop-filter: blur(4px);
    width: fit-content;
    font-size: 10px;
    color: #fff;
`;

export const SHOP_PRODUCT_VISIBLE_COUNT = 3;
export const SHOP_PRODUCT_GAP = 6;
export const SHOP_PRODUCT_CARD_WIDTH = 38;

export const ShopProductsBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 6px;
    width: 100%;
    min-width: 0;
`

export const ShopHeaderBar = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;
    max-width: 100%;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(6px);
`

export const ShopHeaderIcon = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ff5629;
    flex-shrink: 0;
`

export const ShopHeaderText = styled.span`
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

export const ShopProductsWrap = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    min-width: 0;
`

export const ShopScrollArrow = styled.button`
    flex-shrink: 0;
    width: 13px;
    height: 22px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    align-self: flex-start;
    margin-top: 22px;
`

export const ShopProductList = styled.div<{ $scrollable?: boolean }>`
    width: fit-content;
    max-width: ${({ $scrollable }) =>
        $scrollable
            ? `calc(${SHOP_PRODUCT_VISIBLE_COUNT} * ${SHOP_PRODUCT_CARD_WIDTH}px + ${(SHOP_PRODUCT_VISIBLE_COUNT - 1) * SHOP_PRODUCT_GAP}px)`
            : '100%'};
    flex-shrink: 0;
    display: flex;
    gap: ${SHOP_PRODUCT_GAP}px;
    overflow-x: ${({ $scrollable }) => ($scrollable ? 'auto' : 'hidden')};
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    box-sizing: border-box;

    &::-webkit-scrollbar {
        display: none;
    }
`

export const ShopProductCard = styled.div`
    width: ${SHOP_PRODUCT_CARD_WIDTH}px;
    flex-shrink: 0;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    gap: 2px;
`

export const ShopProductTitle = styled.div`
    color: #fff;
    font-size: 10px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`

export const ShopProductImageLink = styled.a`
    display: block;
    width: 100%;
    aspect-ratio: 1;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.12);
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    &:hover {
        opacity: 0.92;
    }
`

export const DescriptionText = styled.div<{ $expanded?: boolean }>`
    color: #fff;
    font-size: 12px;
    line-height: 1.45;
    word-break: break-word;

    ${({ $expanded }) =>
    $expanded
      ? `white-space: pre-wrap;`
      : `
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
                white-space: normal;
            `
  }
`;

export const ExpandButton = styled.span`
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
    cursor: pointer;
    display: inline-block;    
    &:hover {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: underline;
    }
`;

export const MusicInfo = styled(Flex)`
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

export const ActionBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

export const ActionButton = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.1s ease;
    
    &:active {
        transform: scale(0.95);
    }
`;

export const ActionIcon = styled.span`
    font-size: 22px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

export const ActionCount = styled.span`
    color: #fff;
    font-size: 10px;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

export const AdTag = styled.span`
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 6;
    padding: 4px 12px;
    border-radius: 6px;
    background: #ff5629;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    pointer-events: none;
`;

export const PlayButtonOverlay = styled.button<{ $show?: boolean }>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    border: none;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4;
    opacity: ${({ $show }) => ($show ? 1 : 0)};
    transition: opacity 0.2s ease;
    pointer-events: ${({ $show }) => ($show ? 'auto' : 'none')};
    cursor: pointer;
    padding: 0;
    color: #fff;

    &:hover {
        background: rgba(0, 0, 0, 0.65);
    }
`;

export const ClickLink = styled.a`
    position: absolute;
    inset: 0;
    z-index: 5;
    cursor: pointer;
`;