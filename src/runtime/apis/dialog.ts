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
  /** 按钮类型 */
  type?: 'none' | 'okCancel' | 'yesNo' | 'yesNoCancel';
  /** 图标类型 */
  icon?: 'info' | 'warning' | 'error';
}

/**
 * MessageBoxResult 消息对话框返回值
 */
export interface MessageBoxResult {
  /** 用户点击的按钮 */
  response: 'ok' | 'cancel' | 'yes' | 'no';
  /** 是否取消 */
  cancelled: boolean;
}

/**
 * OpenDialogOptions 打开文件对话框选项
 */
export interface OpenDialogOptions {
  /** 对话框标题 */
  title?: string;
  /** 默认路径 */
  defaultPath?: string;
  /** 默认文件名 */
  defaultName?: string;
  /** 是否多选 */
  multiple?: boolean;
  /** 文件过滤器 */
  filters?: FileFilter[];
}

/**
 * SaveDialogOptions 保存文件对话框选项
 */
export interface SaveDialogOptions {
  /** 对话框标题 */
  title?: string;
  /** 默认路径 */
  defaultPath?: string;
  /** 默认文件名 */
  defaultName?: string;
  /** 文件过滤器 */
  filters?: FileFilter[];
}

/**
 * ErrorBoxOptions 错误对话框选项
 */
export interface ErrorBoxOptions {
  /** 对话框标题 */
  title?: string;
  /** 错误消息 */
  message: string;
}

/**
 * Dialog API 接口
 */
export interface DialogAPI {
  /** 显示消息对话框，返回用户点击的按钮 */
  showMessageBox: (options: MessageBoxOptions) => Promise<MessageBoxResult>;
  /** 显示错误对话框 */
  showErrorBox: (options: ErrorBoxOptions) => Promise<void>;
  /** 显示打开文件对话框 */
  showOpenDialog: (options?: OpenDialogOptions) => Promise<string | string[] | null>;
  /** 显示保存文件对话框 */
  showSaveDialog: (options?: SaveDialogOptions) => Promise<string | null>;
}

/** 自动注入当前窗口 ID */
function withWindowId(options: Record<string, any>): Record<string, any> {
  const windowId = (window as any).__VOKEX__?.__windowId__;
  return { ...options, windowId };
}

/**
 * 原生对话框 API
 */
export const dialog: DialogAPI = {
  showMessageBox: (options: MessageBoxOptions): Promise<MessageBoxResult> =>
    vokexCall('dialog.showMessageBox', withWindowId(options)),

  showErrorBox: (options: ErrorBoxOptions): Promise<void> =>
    vokexCall('dialog.showErrorBox', withWindowId(options)),

  showOpenDialog: (options?: OpenDialogOptions): Promise<string | string[] | null> =>
    vokexCall('dialog.showOpenDialog', withWindowId(options || {})),

  showSaveDialog: (options?: SaveDialogOptions): Promise<string | null> =>
    vokexCall('dialog.showSaveDialog', withWindowId(options || {})),
};