import { useCallback, useRef, useState } from "react";

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number) => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Yêu cầu bị timeout")), timeoutMs);
    }),
  ]);
};

export interface SequentialBulkProgress<TErrorDetail> {
  isOpen: boolean;
  isProcessing: boolean;
  total: number;
  processed: number;
  successCount: number;
  errorCount: number;
  errors: TErrorDetail[];
}

const initialProgress = <T,>(): SequentialBulkProgress<T> => ({
  isOpen: false,
  isProcessing: false,
  total: 0,
  processed: 0,
  successCount: 0,
  errorCount: 0,
  errors: [],
});

export interface UseSequentialBulkRunnerOptions<TItem, TErrorDetail> {
  /** Khoảng cách giữa hai lần gọi API liên tiếp (ms). Mặc định 0. */
  delayBetweenMs?: number;
  /** Timeout cho mỗi lần gọi `executeItem` (ms). Bỏ qua nếu không truyền hoặc ≤ 0. */
  timeoutMs?: number;
  mapError: (item: TItem, index: number, error: unknown) => TErrorDetail;
  onComplete?: () => void | Promise<void>;
}

/**
 * Chạy một danh sách thao tác tuần tự (không Promise.all), cập nhật tiến độ,
 * hỗ trợ hủy giữa chừng và gom lỗi từng bước.
 */
export function useSequentialBulkRunner<
  TItem,
  TErrorDetail extends { key: string },
>(options: UseSequentialBulkRunnerOptions<TItem, TErrorDetail>) {
  const {
    delayBetweenMs = 0,
    timeoutMs,
    mapError,
    onComplete,
  } = options;

  const [progress, setProgress] =
    useState<SequentialBulkProgress<TErrorDetail>>(initialProgress);
  const cancelRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const reset = useCallback(() => {
    setProgress((prev) =>
      prev.isProcessing ? prev : initialProgress()
    );
  }, []);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const run = useCallback(
    async (
      items: TItem[],
      executeItem: (item: TItem, index: number) => Promise<void>
    ) => {
      if (!items?.length) {
        setProgress({ ...initialProgress(), isOpen: true });
        return;
      }

      cancelRef.current = false;
      setProgress({
        isOpen: true,
        isProcessing: true,
        total: items.length,
        processed: 0,
        successCount: 0,
        errorCount: 0,
        errors: [],
      });

      let successCount = 0;
      let errorCount = 0;
      const errors: TErrorDetail[] = [];

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        if (cancelRef.current) {
          break;
        }

        try {
          const task = executeItem(item, index);
          if (timeoutMs != null && timeoutMs > 0) {
            await withTimeout(task, timeoutMs);
          } else {
            await task;
          }
          successCount += 1;
        } catch (err) {
          errorCount += 1;
          errors.push(mapError(item, index, err));
        } finally {
          const processed = successCount + errorCount;
          setProgress((prev) => ({
            ...prev,
            processed,
            successCount,
            errorCount,
            errors: [...errors],
          }));
        }

        const isLast = index === items.length - 1;
        if (!cancelRef.current && !isLast && delayBetweenMs > 0) {
          await sleep(delayBetweenMs);
        }
      }

      setProgress((prev) => ({
        ...prev,
        isProcessing: false,
      }));

      await onCompleteRef.current?.();
    },
    [delayBetweenMs, timeoutMs, mapError]
  );

  return {
    progress,
    run,
    cancel,
    reset,
  };
}
