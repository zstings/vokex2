/**
 * vokex 框架 - 友好的 API 封装
 *
 * 提供类似 import { os } from 'vokex' 的调用方式
 */

import vokexCall from "./apis/vokexCall";
import { events } from "./apis/events";








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
 * TODO: Rust端未实现，后续可能会实现
 */
// export class Tray {
//   private id: number;

//   constructor(id: number) {
//     this.id = id;
//   }

//   /** 获取托盘 ID */
//   getId(): number {
//     return this.id;
//   }

//   /** 设置鼠标悬停提示文本 */
//   setToolTip(text: string): Promise<void> {
//     return vokexCall('tray.setToolTip', [this.id, text]);
//   }

//   /** 设置托盘标题（macOS） */
//   setTitle(title: string): Promise<void> {
//     return vokexCall('tray.setTitle', [this.id, title]);
//   }

//   /** 设置右键菜单 */
//   setMenu(template: MenuItem[]): Promise<void> {
//     return vokexCall('tray.setMenu', [this.id, template]);
//   }

//   /** 设置托盘图标 */
//   setImage(icon: string): Promise<void> {
//     return vokexCall('tray.setImage', [this.id, icon]);
//   }

//   /** 销毁托盘图标 */
//   destroy(): Promise<void> {
//     return vokexCall('tray.destroy', [this.id]);
//   }

//   /** 显示气泡通知（Windows） */
//   displayBalloon(options: BalloonOptions): Promise<void> {
//     return vokexCall('tray.displayBalloon', [this.id, options]);
//   }

//   /** 监听托盘事件 */
//   on(event: TrayEventType, callback: (data: { trayId: string }) => void): () => void {
//     return events.on(`tray.${event}`, callback);
//   }
// }

/**
 * 托盘 API 接口
 * TODO: Rust端未实现，后续可能会实现
 */
// export interface TrayAPI {
//   /** 创建系统托盘图标 */
//   create: (options: TrayOptions) => Promise<Tray>;
//   /** 设置鼠标悬停提示文本 */
//   setToolTip: (id: number, text: string) => Promise<void>;
//   /** 设置托盘标题（macOS） */
//   setTitle: (id: number, title: string) => Promise<void>;
//   /** 设置右键菜单 */
//   setMenu: (id: number, template: MenuItem[]) => Promise<void>;
//   /** 设置托盘图标 */
//   setImage: (id: number, icon: string) => Promise<void>;
//   /** 销毁托盘图标 */
//   destroy: (id: number) => Promise<void>;
//   /** 显示气泡通知（Windows） */
//   displayBalloon: (id: number, options: BalloonOptions) => Promise<void>;
//   /** 监听托盘事件 */
//   on: (event: TrayEventType, callback: (data: { trayId: string }) => void) => () => void;
// }

/**
 * 系统托盘相关 API
 * TODO: Rust端未实现，后续可能会实现
 */
// export const tray: TrayAPI = {
//   /**
//    * 创建系统托盘图标
//    * @param options 托盘选项
//    * @returns Tray 实例
//    */
//   async create(options: TrayOptions): Promise<Tray> {
//     const id = await vokexCall('tray.create', [options]);
//     return new Tray(id);
//   },

//   /**
//    * 设置鼠标悬停提示文本
//    */
//   setToolTip: (id: number, text: string): Promise<void> => {
//     return vokexCall('tray.setToolTip', [id, text]);
//   },

//   /**
//    * 设置托盘标题（macOS）
//    */
//   setTitle: (id: number, title: string): Promise<void> => {
//     return vokexCall('tray.setTitle', [id, title]);
//   },

//   /**
//    * 设置右键菜单
//    */
//   setMenu: (id: number, template: MenuItem[]): Promise<void> => {
//     return vokexCall('tray.setMenu', [id, template]);
//   },

//   /**
//    * 设置托盘图标
//    */
//   setImage: (id: number, icon: string): Promise<void> => {
//     return vokexCall('tray.setImage', [id, icon]);
//   },

//   /**
//    * 销毁托盘图标
//    */
//   destroy: (id: number): Promise<void> => {
//     return vokexCall('tray.destroy', [id]);
//   },

//   /**
//    * 显示气泡通知（Windows）
//    */
//   displayBalloon: (id: number, options: BalloonOptions): Promise<void> => {
//     return vokexCall('tray.displayBalloon', [id, options]);
//   },

//   /**
//    * 监听托盘事件
//    */
//   on: (event: TrayEventType, callback: (data: { trayId: string }) => void): () => void => {
//     return events.on(`tray.${event}`, callback);
//   },
// };

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
export { menu } from './apis/menu';
export { browserWindow } from './apis/browserWindow';

