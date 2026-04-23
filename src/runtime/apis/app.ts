import vokexCall from "./vokexCall";
import { events } from './events';
/**
 * App 事件类型
 */
export type AppEvent = 'ready' | 'window-all-closed' | 'before-quit' | 'second-instance' | 'activate';
/**
 * App API 接口
 */
export interface AppAPI {
  /** 退出应用 */
  quit: () => Promise<void>;
  /** 立即退出应用，不触发生命周期事件 */
  exit: (code?: number) => Promise<void>;
  /** 重启应用 */
  restart: () => Promise<void>;
  /** 获取应用安装目录路径 */
  getAppPath: () => Promise<string>;
  /**
   * 获取系统特殊目录路径
   * @param name 目录名称：home | appData | desktop | documents | downloads | temp
   */
  getPath: (name: "home" | "appData" | "desktop" | "documents" | "downloads" | "temp" | "cwd") => Promise<string>;
  /** 获取应用版本号（来自 vokex-config.json） */
  getVersion: () => Promise<string>;
  /** 获取应用名称（来自 vokex-config.json） */
  getName: () => Promise<string>;
  /** 获取应用标识符（来自 vokex-config.json） */
  getIdentifier: () => Promise<string>;
  /** 获取系统语言标识，如 zh-CN、en-US */
  getLocale: () => Promise<string>;
  /** 获取当前进程 PID */
  getPid: () => Promise<number>;
  /** 获取命令行参数数组 */
  getArgv: () => Promise<string[]>;
  /**
   * 获取环境变量值
   * @param key 环境变量名称，如 PATH、HOME
   */
  getEnv: (key: string) => Promise<string>;
  /** 获取操作系统类型，如 windows、linux、macos */
  getPlatform: () => Promise<string>;
  /** 获取系统架构，如 x86_64、aarch64 */
  getArch: () => Promise<string>;
  // /** 设置 macOS Dock 图标徽标 */
  // setDockBadge: (text: string) => Promise<void>;
  /** 请求单实例锁，防止重复启动 */
  requestSingleInstanceLock: () => Promise<boolean>;
  // /** 设置应用代理 */
  // setProxy: (config: ProxyConfig) => Promise<void>;
  /** 监听应用事件 */
  on: (event: AppEvent, callback: (data?: any) => void) => void;
}

/**
 * 应用相关 API
 */
export const app: AppAPI = {
  /**
   * 退出应用
   */
  quit: (): Promise<void> => vokexCall('app.quit'),

  /**
   * 立即退出应用，不触发生命周期事件
   * @param code 退出码，默认 0
   */
  exit: (code?: number): Promise<void> => vokexCall('app.exit', { code }),

  /**
   * 重启应用
   */
  restart: (): Promise<void> => vokexCall('app.restart'),

  /**
   * 获取应用安装目录路径
   */
  getAppPath: (): Promise<string> => vokexCall('app.getAppPath'),

  /**
   * 获取系统特殊目录路径
   * @param name 目录名：home | appData | desktop | documents | downloads | temp
   */
  getPath: (name: string): Promise<string> => vokexCall('app.getPath', { name }),

  /**
   * 获取应用版本号（来自 vokex-config.json）
   */
  getVersion: (): Promise<string> => vokexCall('app.getVersion'),

  /**
   * 获取应用名称（来自 vokex-config.json）
   */
  getName: (): Promise<string> => vokexCall('app.getName'),

  /**
   * 获取应用标识符（来自 vokex-config.json）
   */
  getIdentifier: (): Promise<string> => vokexCall('app.getIdentifier'),

  /**
   * 获取系统语言标识，如 zh-CN、en-US
   */
  getLocale: (): Promise<string> => vokexCall('app.getLocale'),

  /**
   * 获取当前进程 PID
   */
  getPid: (): Promise<number> => vokexCall('app.getPid'),

  /**
   * 获取命令行参数数组
   */
  getArgv: (): Promise<string[]> => vokexCall('app.getArgv'),

  /**
   * 获取环境变量值
   * @param key 环境变量名称，如 PATH、HOME
   */
  getEnv: (key: string): Promise<string> => vokexCall('app.getEnv', { key }),

  /**
   * 获取操作系统类型，如 windows、linux、macos
   */
  getPlatform: (): Promise<string> => vokexCall('app.getPlatform'),

  /**
   * 获取系统架构，如 x86_64、aarch64
   */
  getArch: (): Promise<string> => vokexCall('app.getArch'),

  // /** 设置 macOS Dock 图标徽标 */
  // setDockBadge: (text: string): Promise<void> => vokexCall('app.setDockBadge', { text }),

  /** 请求单实例锁，防止重复启动 */
  requestSingleInstanceLock: (): Promise<boolean> => vokexCall('app.requestSingleInstanceLock'),

  // /** 设置应用代理 */
  // setProxy: (config: ProxyConfig): Promise<void> => vokexCall('app.setProxy', { config }),

  /**
   * 监听应用事件
   * @param event 事件名：ready | window-all-closed | before-quit | second-instance | activate
   * @param callback 事件回调函数
   */
  on: (event: 'ready' | 'window-all-closed' | 'before-quit' | 'second-instance' | 'activate', callback: (data?: any) => void): void => {
    events.on(`app.${event}`, callback);
  },
};