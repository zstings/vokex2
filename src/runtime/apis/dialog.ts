import vokexCall from "./vokexCall";

/**
 * FileFilter 文件过滤器
 */
export interface FileFilter {
    /** 过滤器名称 */
    name: string;
    /** 文件扩展名列表 */
    extensions: string[];
  }
  
  /**
   * MessageBoxOptions 消息对话框选项
   */
  export interface MessageBoxOptions {
    /** 对话框标题 */
    title?: string;
    /** 消息内容 */
    message: string;
    /** 对话框类型 */
    type?: 'info' | 'warning' | 'error';
  }
  
  /**
   * OpenDialogOptions 打开文件对话框选项
   */
  export interface OpenDialogOptions {
    /** 对话框标题 */
    title?: string;
    /** 文件过滤器 */
    filters?: FileFilter[];
  }
  
  /**
   * SaveDialogOptions 保存文件对话框选项
   */
  export interface SaveDialogOptions {
    /** 对话框标题 */
    title?: string;
    /** 默认文件名 */
    defaultName?: string;
    /** 文件过滤器 */
    filters?: FileFilter[];
  }
  
  /**
   * Dialog API 接口
   */
  export interface DialogAPI {
    /** 显示消息对话框 */
    showMessageBox: (options: MessageBoxOptions) => Promise<void>;
    /** 显示打开文件对话框 */
    showOpenDialog: (options?: OpenDialogOptions) => Promise<string | null>;
    /** 显示保存文件对话框 */
    showSaveDialog: (options?: SaveDialogOptions) => Promise<string | null>;
  }
  
  /**
   * 原生对话框 API
   */
  export const dialog: DialogAPI = {
    /**
     * 显示消息对话框
     * @param options 对话框选项
     */
    showMessageBox: (options: MessageBoxOptions): Promise<void> =>
      vokexCall('dialog.showMessageBox', options),
  
    /**
     * 显示打开文件对话框
     * @param options 对话框选项
     * @returns 用户选择的文件路径，取消返回 null
     */
    showOpenDialog: (options?: OpenDialogOptions): Promise<string | null> =>
      vokexCall('dialog.showOpenDialog', options || {}),
  
    /**
     * 显示保存文件对话框
     * @param options 对话框选项
     * @returns 用户选择的保存路径，取消返回 null
     */
    showSaveDialog: (options?: SaveDialogOptions): Promise<string | null> =>
      vokexCall('dialog.showSaveDialog', options || {}),
  };