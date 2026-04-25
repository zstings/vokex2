import vokexCall from "./vokexCall";
/**
 * Clipboard API 接口
 */
export interface ClipboardAPI {
  /** 读取剪贴板文本 */
  readText: () => Promise<string>;
  /** 写入文本到剪贴板 */
  writeText: (text: string) => Promise<void>;
  /** 清空剪贴板 */
  clear: () => Promise<void>;
}

/**
 * 剪贴板 API
 */
export const clipboard: ClipboardAPI = {
  /**
   * 读取剪贴板文本
   */
  readText: (): Promise<string> => vokexCall('clipboard.readText', {}),

  /**
   * 写入文本到剪贴板
   * @param text 要写入的文本
   */
  writeText: (text: string): Promise<void> => vokexCall('clipboard.writeText', { text }),

  /**
   * 清空剪贴板
   */
  clear: (): Promise<void> => vokexCall('clipboard.clear', {}),
};