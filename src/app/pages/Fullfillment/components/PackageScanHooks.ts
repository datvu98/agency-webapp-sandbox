import { useCallback, useEffect, useRef } from "react";

// Hook: useScanDetection - Detect barcode scan
export const useScanDetection = ({
    timeToEvaluate = 150,
    averageWaitTime = 50,
    startCharacter = [],
    onComplete,
    onError,
    minLength = 1,
    ignoreIfFocusOn,
    stopPropagation = false,
    preventDefault = false,
    container = document
}: {
    timeToEvaluate?: number;
    averageWaitTime?: number;
    startCharacter?: number[];
    onComplete: (code: string) => void;
    onError?: (code: string) => void;
    minLength?: number;
    ignoreIfFocusOn?: any;
    stopPropagation?: boolean;
    preventDefault?: boolean;
    container?: Document | HTMLElement;
}) => {
    const buffer = useRef<Array<{ time: number; char: string }>>([]);
    const timeout = useRef<any>(false);

    const clearBuffer = () => {
        buffer.current = [];
    };

    const evaluateBuffer = () => {
        clearTimeout(timeout.current);
        if (buffer.current.length < 2) {
            clearBuffer();
            return;
        }
        
        const sum = buffer.current
            .map(({ time }, k, arr) => k > 0 ? time - arr[k - 1].time : 0)
            .slice(1)
            .reduce((total, delta) => total + delta, 0);
        const avg = sum / (buffer.current.length - 1);

        const code = buffer.current
            .slice(startCharacter.length > 0 ? 1 : 0)
            .map(({ char }) => char)
            .join("");

        if (
            avg <= averageWaitTime &&
            buffer.current.slice(startCharacter.length > 0 ? 1 : 0).length >= minLength
        ) {
            onComplete(code.replaceAll('Shift', ''));
        } else {
            avg <= averageWaitTime && !!onError && onError(code);
        }
        clearBuffer();
    };

    const onInput = useCallback((event: any) => {
        const target = event.target as HTMLInputElement;
        if (ignoreIfFocusOn && target !== ignoreIfFocusOn) {
            return;
        }
        
        const currentValue = target.value || '';
        const char = currentValue.slice(-1);
        if (char && (buffer.current.length === 0 || startCharacter.length === 0 || startCharacter.includes(event.keyCode || 0))) {
            clearTimeout(timeout.current);
            timeout.current = setTimeout(evaluateBuffer, timeToEvaluate);
            buffer.current.push({ time: performance.now(), char });
        }
        
        if (stopPropagation) {
            event.stopPropagation();
        }
        if (preventDefault) {
            event.preventDefault();
        }
    }, [
        timeToEvaluate,
        startCharacter,
        ignoreIfFocusOn,
        stopPropagation,
        preventDefault
    ]);

    useEffect(() => {
        return () => {
            clearTimeout(timeout.current);
        };
    }, []);

    useEffect(() => {
        if (container && container !== document) {
            const inputElement = container as HTMLElement;
            inputElement.addEventListener("input", onInput);
            return () => {
                inputElement.removeEventListener("input", onInput);
            };
        } else {
            document.addEventListener("input", onInput);
            return () => {
                document.removeEventListener("input", onInput);
            };
        }
    }, [onInput, container]);
};

// Hook: useOnKeyPress - Handle keyboard shortcuts
export const useOnKeyPress = (callback: () => void, targetKey: string) => {
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === targetKey) {
                callback();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [callback, targetKey]);
};

