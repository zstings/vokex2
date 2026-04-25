/**
 * vokex 框架 - 友好的 API 封装
 *
 * 提供类似 import { os } from 'vokex' 的调用方式
 */

import vokexCall from "./apis/vokexCall";
import { events } from "./apis/events";

/**
 * 窗口选项
 */
export interface WindowOptions {
  /** 窗口标题 */
  title?: string;
  /** 窗口宽度 */
  width?: number;
  /** 窗口高度 */
  height?: number;
  /** 窗口 X 坐标 */
  x?: number;
  /** 窗口 Y 坐标 */
  y?: number;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 是否最小化 */
  minimizable?: boolean;
  /** 是否最大化 */
  maximizable?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否置顶 */
  alwaysOnTop?: boolean;
  /** 是否全屏 */
  fullscreen?: boolean;
  /** 是否显示在任务栏 */
  skipTaskbar?: boolean;
  /** 窗口透明度 (0.0 - 1.0) [Windows] [macOS] */
  opacity?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** 最小宽度 */
  minWidth?: number;
  /** 最小高度 */
  minHeight?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 窗口图标路径 [Windows] [Linux] */
  icon?: string;
  /** 是否显示 */
  show?: boolean;
  /** 是否居中 */
  center?: boolean;
  /** 加载的 URL */
  url?: string;
}

/**
 * 窗口信息
 */
export interface WindowInfo {
  /** 窗口 ID */
  id: number;
  /** 窗口标题 */
  title: string;
  /** 窗口宽度 */
  width: number;
  /** 窗口高度 */
  height: number;
  /** 窗口 X 坐标 */
  x: number;
  /** 窗口 Y 坐标 */
  y: number;
  /** 是否最大化 */
  is_maximized: boolean;
  /** 是否最小化 */
  is_minimized: boolean;
  /** 是否全屏 */
  is_fullscreen: boolean;
  /** 是否聚焦 */
  is_focused: boolean;
  /** 是否可见 */
  is_visible: boolean;
}

/**
 * 窗口事件类型
 */
export type WindowEventType = 
  | 'close' 
  | 'resize' 
  | 'move' 
  | 'minimize' 
  | 'maximize' 
  | 'restore' 
  | 'focus' 
  | 'blur' 
  | 'enter-full-screen' 
  | 'leave-full-screen';

/**
 * BrowserWindow 实例类
 */
export class BrowserWindow {
  private id: number;
  private eventListeners: Map<WindowEventType, Set<(data: any) => void>> = new Map();

  constructor(id: number) {
    this.id = id;
    this.setupEventListeners();
  }

  /** 获取窗口 ID */
  getId(): number {
    return this.id;
  }

  /** 关闭窗口 [通用] */
  close(): Promise<void> {
    return vokexCall('browserWindow.close', [this.id]);
  }

  /** 显示窗口 [通用] */
  show(): Promise<void> {
    return vokexCall('browserWindow.show', [this.id]);
  }

  /** 隐藏窗口 [通用] */
  hide(): Promise<void> {
    return vokexCall('browserWindow.hide', [this.id]);
  }

  /** 最小化窗口 [通用] */
  minimize(): Promise<void> {
    return vokexCall('browserWindow.minimize', [this.id]);
  }

  /** 最大化窗口 [通用] */
  maximize(): Promise<void> {
    return vokexCall('browserWindow.maximize', [this.id]);
  }

  /** 取消最大化 [通用] */
  unmaximize(): Promise<void> {
    return vokexCall('browserWindow.unmaximize', [this.id]);
  }

  /** 恢复窗口 [通用] */
  restore(): Promise<void> {
    return vokexCall('browserWindow.restore', [this.id]);
  }

  /** 聚焦窗口 [通用] */
  focus(): Promise<void> {
    return vokexCall('browserWindow.focus', [this.id]);
  }

  /** 取消聚焦 [通用] */
  blur(): Promise<void> {
    return vokexCall('browserWindow.blur', [this.id]);
  }

  /** 是否最大化 [通用] */
  isMaximized(): Promise<boolean> {
    return vokexCall('browserWindow.isMaximized', [this.id]);
  }

  /** 是否最小化 [通用] */
  isMinimized(): Promise<boolean> {
    return vokexCall('browserWindow.isMinimized', [this.id]);
  }

  /** 是否全屏 [通用] */
  isFullScreen(): Promise<boolean> {
    return vokexCall('browserWindow.isFullScreen', [this.id]);
  }

  /** 设置全屏状态 [通用] */
  setFullScreen(flag: boolean): Promise<void> {
    return vokexCall('browserWindow.setFullScreen', [this.id, flag]);
  }

  /** 设置窗口标题 [通用] */
  setTitle(title: string): Promise<void> {
    return vokexCall('browserWindow.setTitle', [this.id, title]);
  }

  /** 获取窗口标题 [通用] */
  getTitle(): Promise<string> {
    return vokexCall('browserWindow.getTitle', [this.id]);
  }

  /** 设置窗口大小 [通用] */
  setSize(width: number, height: number): Promise<void> {
    return vokexCall('browserWindow.setSize', [this.id, width, height]);
  }

  /** 获取窗口大小 [通用] */
  async getSize(): Promise<[number, number]> {
    return vokexCall('browserWindow.getSize', [this.id]);
  }

  /** 设置最小窗口尺寸 [通用] */
  setMinimumSize(width: number, height: number): Promise<void> {
    return vokexCall('browserWindow.setMinimumSize', [this.id, width, height]);
  }

  /** 设置最大窗口尺寸 [通用] */
  setMaximumSize(width: number, height: number): Promise<void> {
    return vokexCall('browserWindow.setMaximumSize', [this.id, width, height]);
  }

  /** 设置窗口是否可调整大小 [通用] */
  setResizable(flag: boolean): Promise<void> {
    return vokexCall('browserWindow.setResizable', [this.id, flag]);
  }

  /** 设置窗口是否置顶 [通用] */
  setAlwaysOnTop(flag: boolean): Promise<void> {
    return vokexCall('browserWindow.setAlwaysOnTop', [this.id, flag]);
  }

  /** 设置窗口位置 [通用] */
  setPosition(x: number, y: number): Promise<void> {
    return vokexCall('browserWindow.setPosition', [this.id, x, y]);
  }

  /** 获取窗口位置 [通用] */
  async getPosition(): Promise<[number, number]> {
    return vokexCall('browserWindow.getPosition', [this.id]);
  }

  /** 窗口居中 [通用] */
  center(): Promise<void> {
    return vokexCall('browserWindow.center', [this.id]);
  }

  /** 设置窗口透明度 (0.0 - 1.0) [Windows] [macOS] */
  setOpacity(opacity: number): Promise<void> {
    return vokexCall('browserWindow.setOpacity', [this.id, opacity]);
  }

  /** 设置窗口背景色 [通用] */
  setBackgroundColor(color: string): Promise<void> {
    return vokexCall('browserWindow.setBackgroundColor', [this.id, color]);
  }

  /** 设置窗口图标 [Windows] [Linux] */
  setIcon(icon: string): Promise<void> {
    return vokexCall('browserWindow.setIcon', [this.id, icon]);
  }

  /** 加载本地 HTML 文件 [通用] */
  loadFile(path: string): Promise<void> {
    return vokexCall('browserWindow.loadFile', [this.id, path]);
  }

  /** 加载远程 URL [通用] */
  loadURL(url: string): Promise<void> {
    return vokexCall('browserWindow.loadURL', [this.id, url]);
  }

  /** 重新加载当前页面 [通用] */
  reload(): Promise<void> {
    return vokexCall('browserWindow.reload', [this.id]);
  }

  /** 设置任务栏进度条 (0.0 - 1.0, -1 隐藏) [Windows] [macOS] */
  setProgressBar(progress: number): Promise<void> {
    return vokexCall('browserWindow.setProgressBar', [this.id, progress]);
  }

  /** 设置是否在任务栏中显示 [Windows] */
  setSkipTaskbar(flag: boolean): Promise<void> {
    return vokexCall('browserWindow.setSkipTaskbar', [this.id, flag]);
  }

  /** 截取窗口内容 [通用] */
  capturePage(): Promise<string> {
    return vokexCall('browserWindow.capturePage', [this.id]);
  }

  /** 监听窗口事件 [通用] */
  on(event: WindowEventType, callback: (data?: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  /** 取消监听窗口事件 [通用] */
  off(event: WindowEventType, callback: (data?: any) => void): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /** 设置事件监听器 [通用] */
  private setupEventListeners(): void {
    // 监听来自后端的窗口事件
    events.on('window.event', (data: { windowId: number; event: any }) => {
      if (data.windowId === this.id) {
        const eventType = data.event.type as WindowEventType;
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
          listeners.forEach(callback => {
            try {
              callback(data.event);
            } catch (e) {
              console.error(`Error in window event listener for ${eventType}:`, e);
            }
          });
        }
      }
    });
  }
}

/**
 * BrowserWindow 静态方法
 */
export const browserWindow = {
  /**
   * 创建新窗口 [通用]
   * @param options 窗口选项
   * @returns BrowserWindow 实例
   */
  async create(options: WindowOptions = {}): Promise<BrowserWindow> {
    const result = await vokexCall('browserWindow.create', [options]);
    return new BrowserWindow(result.id);
  },

  /**
   * 获取所有窗口 [通用]
   * @returns 窗口信息数组
   */
  getAll(): Promise<WindowInfo[]> {
    return vokexCall('browserWindow.getAll');
  },

  /**
   * 获取当前聚焦的窗口 [通用]
   * @returns 窗口信息或 null
   */
  getFocused(): Promise<WindowInfo | null> {
    return vokexCall('browserWindow.getFocused');
  },

  /**
   * 根据 ID 获取窗口 [通用]
   * @param id 窗口 ID
   * @returns BrowserWindow 实例或 null
   */
  async getById(id: number): Promise<BrowserWindow | null> {
    const info = await vokexCall('browserWindow.getById', [id]);
    if (info) {
      return new BrowserWindow(id);
    }
    return null;
  },

  /**
   * 获取主窗口 [通用]
   * @returns BrowserWindow 实例或 null
   */
  async getMainWindow(): Promise<BrowserWindow | null> {
    // 主窗口 ID 固定为 1
    const info = await vokexCall('browserWindow.getById', [1]);
    if (info) {
      return new BrowserWindow(1);
    }
    return null;
  },
};




/**
 * ProxyConfig 接口
 */
export interface ProxyConfig {
  proxyRules: string;
  pacScript?: string;
  proxyBypassRules?: string;
}


// ==============================
// 菜单 API
// ==============================

/**
 * 菜单项类型
 */
export type MenuItemType = 'normal' | 'separator' | 'submenu' | 'checkbox' | 'native';

/**
 * 原生菜单项标签
 */
export type NativeLabel =
  | 'separator' | 'copy' | 'cut' | 'paste' | 'selectAll'
  | 'undo' | 'redo' | 'minimize' | 'maximize' | 'fullscreen'
  | 'hide' | 'hideOthers' | 'showAll' | 'closeWindow'
  | 'quit' | 'about' | 'services' | 'bringAllToFront';

/**
 * 菜单项接口
 */
export interface MenuItem {
  /** 菜单项类型 */
  type?: MenuItemType;
  /** 菜单项 ID（点击事件中返回） */
  id?: string;
  /** 菜单项标签文本 */
  label?: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 是否选中（checkbox 类型） */
  checked?: boolean;
  /** 快捷键，如 "Ctrl+Shift+S" */
  accelerator?: string;
  /** 子菜单项 */
  submenu?: MenuItem[];
  /** 原生菜单项标签（native 类型） */
  nativeLabel?: NativeLabel;
}

/**
 * 菜单 API 接口
 */
export interface MenuAPI {
  /** 设置应用菜单栏 */
  setApplicationMenu: (template: MenuItem[]) => Promise<void>;
  /** 设置右键上下文菜单 */
  setContextMenu: (template: MenuItem[]) => Promise<void>;
  /** 移除右键上下文菜单 */
  removeContextMenu: () => Promise<void>;
  /** 向应用发送菜单动作（macOS） */
  sendAction: (action: string) => Promise<void>;
  /** 监听菜单点击事件 */
  on: (event: 'clicked', callback: (data: { menuId: string }) => void) => void;
}

/**
 * 原生菜单相关 API
 */
export const menu: MenuAPI = {
  /**
   * 设置应用菜单栏
   * @param template 菜单项模板数组
   */
  setApplicationMenu: (template: MenuItem[]): Promise<void> => {
    return vokexCall('menu.setApplicationMenu', [template]);
  },

  /**
   * 设置右键上下文菜单
   * @param template 菜单项模板数组
   */
  setContextMenu: (template: MenuItem[]): Promise<void> => {
    return vokexCall('menu.setContextMenu', [template]);
  },

  /**
   * 移除右键上下文菜单
   */
  removeContextMenu: (): Promise<void> => {
    return vokexCall('menu.removeContextMenu');
  },

  /**
   * 向应用发送菜单动作（macOS）
   * @param action 菜单动作字符串
   */
  sendAction: (action: string): Promise<void> => {
    return vokexCall('menu.sendAction', [action]);
  },

  /**
   * 监听菜单点击事件
   * @param event 事件名
   * @param callback 回调函数，接收菜单项 ID
   */
  on: (event: 'clicked', callback: (data: { menuId: string }) => void): void => {
    events.on(`menu.${event}`, callback);
  },
};

// ==============================
// 系统托盘 API
// ==============================

/**
 * 托盘选项
 */
export interface TrayOptions {
  /** 图标文件路径（PNG/ICO） */
  icon: string;
  /** 鼠标悬停提示文本 */
  tooltip?: string;
  /** 托盘标题（macOS） */
  title?: string;
  /** 右键菜单 */
  menu?: MenuItem[];
}

/**
 * 气泡通知选项（Windows）
 */
export interface BalloonOptions {
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  content: string;
  /** 图标路径 */
  icon?: string;
}

/**
 * 托盘事件类型
 */
export type TrayEventType = 'click' | 'right-click' | 'double-click';

/**
 * Tray 实例类
 */
export class Tray {
  private id: number;

  constructor(id: number) {
    this.id = id;
  }

  /** 获取托盘 ID */
  getId(): number {
    return this.id;
  }

  /** 设置鼠标悬停提示文本 */
  setToolTip(text: string): Promise<void> {
    return vokexCall('tray.setToolTip', [this.id, text]);
  }

  /** 设置托盘标题（macOS） */
  setTitle(title: string): Promise<void> {
    return vokexCall('tray.setTitle', [this.id, title]);
  }

  /** 设置右键菜单 */
  setMenu(template: MenuItem[]): Promise<void> {
    return vokexCall('tray.setMenu', [this.id, template]);
  }

  /** 设置托盘图标 */
  setImage(icon: string): Promise<void> {
    return vokexCall('tray.setImage', [this.id, icon]);
  }

  /** 销毁托盘图标 */
  destroy(): Promise<void> {
    return vokexCall('tray.destroy', [this.id]);
  }

  /** 显示气泡通知（Windows） */
  displayBalloon(options: BalloonOptions): Promise<void> {
    return vokexCall('tray.displayBalloon', [this.id, options]);
  }

  /** 监听托盘事件 */
  on(event: TrayEventType, callback: (data: { trayId: string }) => void): () => void {
    return events.on(`tray.${event}`, callback);
  }
}

/**
 * 托盘 API 接口
 */
export interface TrayAPI {
  /** 创建系统托盘图标 */
  create: (options: TrayOptions) => Promise<Tray>;
  /** 设置鼠标悬停提示文本 */
  setToolTip: (id: number, text: string) => Promise<void>;
  /** 设置托盘标题（macOS） */
  setTitle: (id: number, title: string) => Promise<void>;
  /** 设置右键菜单 */
  setMenu: (id: number, template: MenuItem[]) => Promise<void>;
  /** 设置托盘图标 */
  setImage: (id: number, icon: string) => Promise<void>;
  /** 销毁托盘图标 */
  destroy: (id: number) => Promise<void>;
  /** 显示气泡通知（Windows） */
  displayBalloon: (id: number, options: BalloonOptions) => Promise<void>;
  /** 监听托盘事件 */
  on: (event: TrayEventType, callback: (data: { trayId: string }) => void) => () => void;
}

/**
 * 系统托盘相关 API
 */
export const tray: TrayAPI = {
  /**
   * 创建系统托盘图标
   * @param options 托盘选项
   * @returns Tray 实例
   */
  async create(options: TrayOptions): Promise<Tray> {
    const id = await vokexCall('tray.create', [options]);
    return new Tray(id);
  },

  /**
   * 设置鼠标悬停提示文本
   */
  setToolTip: (id: number, text: string): Promise<void> => {
    return vokexCall('tray.setToolTip', [id, text]);
  },

  /**
   * 设置托盘标题（macOS）
   */
  setTitle: (id: number, title: string): Promise<void> => {
    return vokexCall('tray.setTitle', [id, title]);
  },

  /**
   * 设置右键菜单
   */
  setMenu: (id: number, template: MenuItem[]): Promise<void> => {
    return vokexCall('tray.setMenu', [id, template]);
  },

  /**
   * 设置托盘图标
   */
  setImage: (id: number, icon: string): Promise<void> => {
    return vokexCall('tray.setImage', [id, icon]);
  },

  /**
   * 销毁托盘图标
   */
  destroy: (id: number): Promise<void> => {
    return vokexCall('tray.destroy', [id]);
  },

  /**
   * 显示气泡通知（Windows）
   */
  displayBalloon: (id: number, options: BalloonOptions): Promise<void> => {
    return vokexCall('tray.displayBalloon', [id, options]);
  },

  /**
   * 监听托盘事件
   */
  on: (event: TrayEventType, callback: (data: { trayId: string }) => void): () => void => {
    return events.on(`tray.${event}`, callback);
  },
};

/**
 * 底层调用（兼容旧版 API）
 */
export const call = (method: string, args: any[] = []): Promise<any> => {
  return vokexCall(method, args);
};

/**
 * CPU 信息
 */
export interface CpuInfo {
  /** CPU 制造商 */
  manufacturer: string;
  /** CPU 型号 */
  model: string;
  /** 物理核心数 */
  cores: number;
  /** 逻辑处理器数 */
  logicalProcessors: number;
  /** 架构 */
  architecture: string;
}

/**
 * 系统内存信息
 */
export interface MemoryInfo {
  /** 总内存（字节） */
  total: number;
  /** 可用内存（字节） */
  available: number;
  /** 已用内存（字节） */
  used: number;
}

/**
 * 操作系统信息
 */
export interface OsInfo {
  /** 操作系统名称 */
  name: string;
  /** 操作系统版本 */
  version: string;
  /** 平台 */
  platform: string;
  /** 架构 */
  arch: string;
}

export { app } from './apis/app';
export { events } from './apis/events';
export { storage } from './apis/storage';
export { fs } from './apis/fs';
export { shell } from './apis/shell';
export { process } from './apis/process';
export { http } from './apis/http';
export { clipboard } from './apis/clipboard';
export { dialog } from './apis/dialog';
export { notification } from './apis/notification';
export { computer } from './apis/computer';

