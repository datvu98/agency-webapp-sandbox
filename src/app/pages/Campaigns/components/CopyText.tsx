import { CopyOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

interface CopyTextProps {
    children: React.ReactNode;

    /** Text thực sự sẽ copy. Nếu không truyền, component cố gắng suy ra từ children */
    text?: string;

    /** Tooltip khi chưa copy */
    copyTooltip?: string;

    /** Tooltip sau khi copy */
    copiedTooltip?: string;

    /** Thời gian hiển thị trạng thái Copied (ms) */
    copiedDurationMs?: number;

    className?: string;
    style?: React.CSSProperties;

    disabled?: boolean;

    /** 
     * true: mặc định ẩn icon, hover mới hiện
     * false: luôn hiển thị icon
     */
    hideIcon?: boolean;
}

/** Bỏ @ đầu chuỗi khi copy (vd. @upbeautysuthat → upbeautysuthat) */
const normalizeCopyText = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.startsWith('@')) {
        return trimmed.replace(/^@+/, '');
    }
    return trimmed;
};

const fallbackCopy = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

const CopyText = ({
    children,
    text,
    copyTooltip = 'Copy',
    copiedTooltip = 'Copied',
    copiedDurationMs = 1500,
    className,
    style,
    disabled,
    hideIcon = true, // ✅ default: hover mới hiện
}: CopyTextProps) => {
    const [isHover, setIsHover] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const timerRef = useRef<number | null>(null);

    // 🔥 Tính text để copy
    const computedText = useMemo(() => {
        if (text != null) return text;

        if (typeof children === 'string') return children;
        if (typeof children === 'number') return String(children);

        // hỗ trợ thêm nếu children là element (ví dụ <Text>abc</Text>)
        if (React.isValidElement(children)) {
            const child = children.props?.children;
            if (typeof child === 'string') return child;
        }

        return '';
    }, [children, text]);

    const textToCopy = useMemo(() => normalizeCopyText(computedText), [computedText]);

    const handleCopy = async () => {
        if (disabled) return;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
        } catch {
            fallbackCopy(textToCopy);
        }

        setIsCopied(true);

        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
        }

        timerRef.current = window.setTimeout(() => {
            setIsCopied(false);
        }, copiedDurationMs);
    };

    return (
        <span
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: disabled || !computedText ? 'default' : 'pointer',
                ...style,
            }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={handleCopy}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleCopy();
                }
            }}
        >
            {/* TEXT */}
            <span style={{ lineHeight: 1.2 }}>{children}</span>

            {/* ICON */}
            {!disabled && computedText && (
                <Tooltip title={isCopied ? copiedTooltip : copyTooltip}>
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#8c8c8c',

                            // 🔥 logic hideIcon
                            opacity: hideIcon ? (isHover ? 1 : 0) : 1,
                            pointerEvents: hideIcon && !isHover ? 'none' : 'auto',

                            transition: 'opacity 0.2s ease',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy();
                        }}
                    >
                        <CopyOutlined />
                    </span>
                </Tooltip>
            )}
        </span>
    );
};

export default CopyText;