import type { DataStoreProps } from "./dialogs/ModalAddAccount"

/** Dependencies cần cho từng loại action thêm tài khoản */
export interface AddAccountHandlersDeps {
  /** Dùng cho TikTok: gọi API scSaleAuthorizationUrl và redirect */
  authorizeTiktok: (connector_channel_code: string) => Promise<void>
  // Thêm các API/handler khác sau, ví dụ:
  // authorizeFacebook: (params) => Promise<void>
}

export type AddAccountHandler = (item: DataStoreProps) => void | Promise<void>

/**
 * Registry: mỗi item.code có 1 action thêm tài khoản riêng.
 * Thêm partner mới: thêm entry vào object return và (nếu cần) thêm dep tương ứng ở AddAccountHandlersDeps.
 */
/** Chuẩn hóa code để so khớp (backend có thể trả về "TikTok" / "tiktok") */
export const normalizePartnerCode = (code: string | undefined) => code?.toLowerCase() ?? ''

export function createAddAccountHandlers(deps: AddAccountHandlersDeps): Record<string, AddAccountHandler> {
  return {
    tiktok: (item) => deps.authorizeTiktok(item.code),
    // Ví dụ mở rộng sau:
    // facebook: (item) => deps.authorizeFacebook(item.code),
  }
}

/** Danh sách code có hỗ trợ action "Thêm" (sẽ render nút trong modal) */
export function getSupportedAddCodes(handlers: Record<string, AddAccountHandler>): string[] {
  return Object.keys(handlers)
}
