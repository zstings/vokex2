/**
 * vokex 框架 - 友好的 API 封装
 *
 * 提供类似 import { os } from 'vokex' 的调用方式
 */

// 内部调用函数
function vokexCall(method: string, args: any[] = []): Promise<any> {
  const vokex = (window as any).__VOKEX__;
  if (!vokex?.call) {
    console.warn(`[vokex] 此 API 仅在原生模式下可用`);
    return Promise.resolve(undefined);
  }
  return vokex.call(method, args);
}

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
 * DirEntry 目录项
 */
export interface DirEntry {
  /** 文件名 */
  name: string;
  /** 完整路径 */
  path: string;
  /** 是否是目录 */
  isDir: boolean;
}

/**
 * FileInfo 文件信息
 */
export interface FileInfo {
  /** 是否是文件 */
  isFile: boolean;
  /** 是否是目录 */
  isDir: boolean;
  /** 文件大小（字节） */
  size: number;
  /** 最后修改时间（距现在秒数） */
  modified?: number;
}

/**
 * 文件系统 API 接口
 */
export interface FsAPI {
  /** 读取文本文件 */
  readFile: (path: string) => Promise<string>;
  /** 读取二进制文件 */
  readFileBinary: (path: string) => Promise<Uint8Array>;
  /** 写入文本文件 */
  writeFile: (path: string, data: string) => Promise<void>;
  /** 追加内容到文件 */
  appendFile: (path: string, data: string) => Promise<void>;
  /** 删除文件 */
  deleteFile: (path: string) => Promise<void>;
  /** 读取目录内容 */
  readDir: (path: string) => Promise<DirEntry[]>;
  /** 创建目录（支持递归创建） */
  createDir: (path: string) => Promise<void>;
  /** 删除目录（支持递归删除） */
  removeDir: (path: string) => Promise<void>;
  /** 获取文件/目录信息 */
  stat: (path: string) => Promise<FileInfo>;
  /** 检查路径是否存在 */
  exists: (path: string) => Promise<boolean>;
  /** 复制文件 */
  copyFile: (source: string, destination: string) => Promise<void>;
  /** 移动/重命名文件 */
  moveFile: (source: string, destination: string) => Promise<void>;
  /** 监听文件/目录变化 */
  watch: (path: string) => any;
}

/**
 * 文件系统相关 API
 */
export const fs: FsAPI = {
  /** 读取文本文件 */
  readFile: (path: string): Promise<string> => vokexCall('fs.readFile', [path]),

  /** 读取二进制文件 */
  readFileBinary: (path: string): Promise<Uint8Array> => vokexCall('fs.readFileBinary', [path]),

  /** 写入文本文件 */
  writeFile: (path: string, data: string): Promise<void> => vokexCall('fs.writeFile', [path, data]),

  /** 追加内容到文件 */
  appendFile: (path: string, data: string): Promise<void> => vokexCall('fs.appendFile', [path, data]),

  /** 删除文件 */
  deleteFile: (path: string): Promise<void> => vokexCall('fs.deleteFile', [path]),

  /** 读取目录内容 */
  readDir: (path: string): Promise<DirEntry[]> => vokexCall('fs.readDir', [path]),

  /** 创建目录（支持递归创建） */
  createDir: (path: string): Promise<void> => vokexCall('fs.createDir', [path]),

  /** 删除目录（支持递归删除） */
  removeDir: (path: string): Promise<void> => vokexCall('fs.removeDir', [path]),

  /** 获取文件/目录信息 */
  stat: (path: string): Promise<FileInfo> => vokexCall('fs.stat', [path]),

  /** 检查路径是否存在 */
  exists: (path: string): Promise<boolean> => vokexCall('fs.exists', [path]),

  /** 复制文件 */
  copyFile: (source: string, destination: string): Promise<void> => vokexCall('fs.copyFile', [source, destination]),

  /** 移动/重命名文件 */
  moveFile: (source: string, destination: string): Promise<void> => vokexCall('fs.moveFile', [source, destination]),

  /** 监听文件/目录变化 */
  watch: (path: string): any => vokexCall('fs.watch', [path]),
};

/**
 * ProxyConfig 接口
 */
export interface ProxyConfig {
  proxyRules: string;
  pacScript?: string;
  proxyBypassRules?: string;
}

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
  /** 获取系统特殊目录路径 */
  getPath: (name: string) => Promise<string>;
  /** 获取应用版本号（来自 package.json） */
  getVersion: () => Promise<string>;
  /** 获取应用名称 */
  getName: () => Promise<string>;
  /** 设置应用名称（该功能实现待定） */
  setName: (name: string) => Promise<void>;
  /** 获取系统语言标识，如 zh-CN、en-US */
  getLocale: () => Promise<string>;
  /** 设置 macOS Dock 图标徽标（该功能实现待定） */
  setDockBadge: (text: string) => Promise<void>;
  /** 请求单实例锁，防止重复启动 */
  requestSingleInstanceLock: () => Promise<boolean>;
  /** 设置应用代理（该功能实现待定） */
  setProxy: (config: ProxyConfig) => Promise<void>;
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
   */
  exit: (code: number = 0): Promise<void> => vokexCall('app.exit', [code]),

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
   * @param name 目录名，如 home、appData、desktop、documents、downloads、pictures、music、videos、temp、exe
   */
  getPath: (name: string): Promise<string> => vokexCall('app.getPath', [name]),

  /**
   * 获取应用版本号（来自 package.json）
   */
  getVersion: (): Promise<string> => vokexCall('app.getVersion'),

  /**
   * 获取应用名称
   */
  getName: (): Promise<string> => vokexCall('app.getName'),

  /**
   * 设置应用名称
   */
  setName: (name: string): Promise<void> => vokexCall('app.setName', [name]),

  /**
   * 获取系统语言标识，如 zh-CN、en-US
   */
  getLocale: (): Promise<string> => vokexCall('app.getLocale'),

  /**
   * 设置 macOS Dock 图标徽标
   */
  setDockBadge: (text: string): Promise<void> => vokexCall('app.setDockBadge', [text]),

  /**
   * 请求单实例锁，防止重复启动
   * @returns true 表示当前是首个实例，false 表示已有实例运行
   */
  requestSingleInstanceLock: (): Promise<boolean> => vokexCall('app.requestSingleInstanceLock'),

  /**
   * 设置应用代理
   */
  setProxy: (config: ProxyConfig): Promise<void> => vokexCall('app.setProxy', [config]),

  /**
   * 监听应用事件
   */
  on: (event: 'ready' | 'window-all-closed' | 'before-quit' | 'second-instance' | 'activate', callback: (data?: any) => void): void => {
    events.on(`app.${event}`, callback);
  },
};

/**
 * CpuUsage 进程 CPU 使用率
 */
export interface CpuUsage {
  user: number;
  system: number;
}

/**
 * MemoryInfo 进程内存信息
 */
export interface MemoryInfo {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
}

/**
 * 进程 API 接口
 */
export interface ProcessAPI {
  /** 获取当前进程 ID */
  getPid: () => Promise<number>;
  /** 获取命令行参数 */
  getArgv: () => Promise<string[]>;
  /** 获取环境变量 */
  getEnv: (key: string) => Promise<string | undefined>;
  /** 获取操作系统平台 */
  getPlatform: () => Promise<string>;
  /** 获取系统架构 */
  getArch: () => Promise<string>;
  /** 获取进程运行时长 */
  getUptime: () => Promise<number>;
  /** 获取进程 CPU 使用率 */
  getCpuUsage: () => Promise<CpuUsage>;
  /** 获取进程内存信息 */
  getMemoryInfo: () => Promise<MemoryInfo>;
  /** 获取用户主目录 */
  homeDir: () => Promise<string>;
  /** 获取临时目录 */
  tempDir: () => Promise<string>;
  /** 获取主机名 */
  hostname: () => Promise<string>;
  /** 获取当前工作目录 */
  cwd: () => Promise<string>;
  /** 获取所有环境变量 */
  env: () => Promise<Record<string, string>>;
  /** 退出当前进程 */
  exit: (code?: number) => Promise<void>;
  /** 终止指定进程 */
  kill: (pid: number, signal?: string) => Promise<void>;
}

/**
 * 进程相关 API
 */
export const process: ProcessAPI = {
  /**
   * 获取当前进程 ID
   */
  getPid: (): Promise<number> => vokexCall('process.getPid'),

  /**
   * 获取命令行参数
   */
  getArgv: (): Promise<string[]> => vokexCall('process.getArgv'),

  /**
   * 获取环境变量
   */
  getEnv: (key: string): Promise<string | undefined> => vokexCall('process.getEnv', [key]),

  /**
   * 获取操作系统平台
   * @returns 'windows' | 'macos' | 'linux'
   */
  getPlatform: (): Promise<string> => vokexCall('process.getPlatform'),

  /**
   * 获取系统架构
   * @returns 'x64' | 'arm64'
   */
  getArch: (): Promise<string> => vokexCall('process.getArch'),

  /**
   * 获取进程运行时长
   */
  getUptime: (): Promise<number> => vokexCall('process.getUptime'),

  /**
   * 获取进程 CPU 使用率
   */
  getCpuUsage: (): Promise<CpuUsage> => vokexCall('process.getCpuUsage'),

  /**
   * 获取进程内存信息
   */
  getMemoryInfo: (): Promise<MemoryInfo> => vokexCall('process.getMemoryInfo'),

  /**
   * 获取用户主目录
   */
  homeDir: (): Promise<string> => vokexCall('process.homeDir'),

  /**
   * 获取临时目录
   */
  tempDir: (): Promise<string> => vokexCall('process.tempDir'),

  /**
   * 获取主机名
   */
  hostname: (): Promise<string> => vokexCall('process.hostname'),

  /**
   * 获取当前工作目录
   */
  cwd: (): Promise<string> => vokexCall('process.cwd'),

  /**
   * 获取所有环境变量
   */
  env: (): Promise<Record<string, string>> => vokexCall('process.env'),

  /**
   * 退出当前进程
   */
  exit: (code: number = 0): Promise<void> => vokexCall('process.exit', [code]),

  /**
   * 终止指定进程
   */
  kill: (pid: number, signal?: string): Promise<void> => vokexCall('process.kill', [pid, signal]),
};

/**
 * ExecOptions 执行命令选项
 */
export interface ExecOptions {
  /** 工作目录 */
  cwd?: string;
  /** 环境变量 */
  env?: Record<string, string>;
}

/**
 * ShellResult 命令执行结果
 */
export interface ShellResult {
  /** 退出码 */
  code: number;
  /** 标准输出 */
  stdout: string;
  /** 标准错误 */
  stderr: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * Shell API 接口
 */
export interface ShellAPI {
  /** 用系统默认浏览器打开 URL */
  openExternal: (url: string) => Promise<void>;
  /** 用系统默认程序打开文件/目录 */
  openPath: (path: string) => Promise<void>;
  /** 执行系统命令 */
  execCommand: (command: string, options?: ExecOptions) => Promise<ShellResult>;
  /** 将文件移到回收站 */
  trashItem: (path: string) => Promise<void>;
}

/**
 * 系统命令与外部程序相关 API
 */
export const shell: ShellAPI = {
  /**
   * 用系统默认浏览器打开 URL
   * @param url 需要打开的 URL
   */
  openExternal: (url: string): Promise<void> => vokexCall('shell.openExternal', [url]),

  /**
   * 用系统默认程序打开文件/目录
   * @param path 文件或目录路径
   */
  openPath: (path: string): Promise<void> => vokexCall('shell.openPath', [path]),

  /**
   * 执行系统命令
   * @param command 要执行的命令字符串
   * @param options 执行选项（可选）
   */
  execCommand: (command: string, options?: ExecOptions): Promise<ShellResult> => vokexCall('shell.execCommand', [command, options]),

  /**
   * 将文件移到回收站
   * @param path 要移动的文件路径
   */
  trashItem: (path: string): Promise<void> => vokexCall('shell.trashItem', [path]),
};

/**
 * 对话框相关 API
 */
export const dialog = {
  // TODO: 实现 dialog API
};

/**
 * 剪贴板相关 API
 */
export const clipboard = {
  // TODO: 实现 clipboard API
};

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
 * NotificationOptions 接口
 */
export interface NotificationOptions {
  /** 通知标题（必填） */
  title: string;
  /** 通知内容 */
  body?: string;
  /** 图标路径 */
  icon?: string;
  /** 是否静音 */
  silent?: boolean;
}

/**
 * 通知相关 API
 */
export const notification = {
  show: (options: NotificationOptions): Promise<void> => {
    return vokexCall('notification.show', [options]);
  },
};

/**
 * 事件监听相关 API
 */
export const events = {
  /**
   * 监听事件
   */
  on: (event: string, listener: (data: any) => void): (() => void) => {
    const vokex = (window as any).__VOKEX__;
    if (vokex?.on) {
      return vokex.on(event, listener);
    }
    return () => {};
  },

  /**
   * 取消监听事件
   */
  off: (event: string, listener: (data: any) => void): void => {
    const vokex = (window as any).__VOKEX__;
    if (vokex?.off) {
      vokex.off(event, listener);
    }
  },

  /**
   * 触发事件（内部使用）
   */
  emit: (event: string, data?: any): void => {
    const vokex = (window as any).__VOKEX__;
    if (vokex?.__emit__) {
      vokex.__emit__(event, data);
    }
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

/**
 * 显示器信息
 */
export interface Display {
  /** 显示器 ID */
  id: string;
  /** 显示器名称 */
  name: string;
  /** 宽度（像素） */
  width: number;
  /** 高度（像素） */
  height: number;
  /** 缩放比例 */
  scaleFactor: number;
  /** 是否为主显示器 */
  isPrimary: boolean;
}

/**
 * Computer API 接口
 */
export interface ComputerAPI {
  /** 获取 CPU 信息 */
  getCpuInfo: () => Promise<CpuInfo>;
  /** 获取系统内存信息 */
  getMemoryInfo: () => Promise<MemoryInfo>;
  /** 获取操作系统信息 */
  getOsInfo: () => Promise<OsInfo>;
  /** 获取显示器列表 */
  getDisplays: () => Promise<Display[]>;
  /** 获取鼠标当前位置 */
  getMousePosition: () => Promise<{ x: number; y: number }>;
  /** 获取当前键盘布局 */
  getKeyboardLayout: () => Promise<string>;
}

/**
 * 系统硬件与信息相关 API
 */
export const computer: ComputerAPI = {
  /** 获取 CPU 信息 */
  getCpuInfo: (): Promise<CpuInfo> => vokexCall('computer.getCpuInfo'),

  /** 获取系统内存信息 */
  getMemoryInfo: (): Promise<MemoryInfo> => vokexCall('computer.getMemoryInfo'),

  /** 获取操作系统信息 */
  getOsInfo: (): Promise<OsInfo> => vokexCall('computer.getOsInfo'),

  /** 获取显示器列表 */
  getDisplays: (): Promise<Display[]> => vokexCall('computer.getDisplays'),

  /** 获取鼠标当前位置 */
  getMousePosition: (): Promise<{ x: number; y: number }> => vokexCall('computer.getMousePosition'),

  /** 获取当前键盘布局 */
  getKeyboardLayout: (): Promise<string> => vokexCall('computer.getKeyboardLayout'),
};

/**
 * HTTP 请求选项
 */
export interface RequestOptions {
  /** 请求方法 */
  method?: string;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求体 */
  body?: string;
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * HTTP 响应
 */
export interface HttpResponse {
  /** 状态码 */
  statusCode: number;
  /** 响应头 */
  headers: Record<string, string>;
  /** 响应体 */
  body: string;
  /** 是否成功（2xx 状态码） */
  ok: boolean;
}

/**
 * HTTP API 接口
 */
export interface HttpAPI {
  /** 发起 GET 请求 */
  get: (url: string, options?: Omit<RequestOptions, 'method' | 'url'>) => Promise<HttpResponse>;
  /** 发起 POST 请求 */
  post: (url: string, data?: any, options?: Omit<RequestOptions, 'method' | 'url'>) => Promise<HttpResponse>;
  /** 发起 PUT 请求 */
  put: (url: string, data?: any, options?: Omit<RequestOptions, 'method' | 'url'>) => Promise<HttpResponse>;
  /** 发起 DELETE 请求 */
  delete: (url: string, options?: Omit<RequestOptions, 'method' | 'url'>) => Promise<HttpResponse>;
  /** 发起自定义请求 */
  request: (options: RequestOptions & { url: string }) => Promise<HttpResponse>;
}

/**
 * HTTP/HTTPS 网络请求 API
 */
export const http: HttpAPI = {
  /** 发起 GET 请求 */
  get: (url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<HttpResponse> => {
    return http.request({
      method: 'GET',
      url,
      ...options,
    });
  },

  /** 发起 POST 请求 */
  post: (url: string, data?: any, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<HttpResponse> => {
    let body: string | undefined;
    if (data !== undefined) {
      if (typeof data === 'string') {
        body = data;
      } else {
        body = JSON.stringify(data);
      }
    }
    return http.request({
      method: 'POST',
      url,
      body,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  },

  /** 发起 PUT 请求 */
  put: (url: string, data?: any, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<HttpResponse> => {
    let body: string | undefined;
    if (data !== undefined) {
      if (typeof data === 'string') {
        body = data;
      } else {
        body = JSON.stringify(data);
      }
    }
    return http.request({
      method: 'PUT',
      url,
      body,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  },

  /** 发起 DELETE 请求 */
  delete: (url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<HttpResponse> => {
    return http.request({
      method: 'DELETE',
      url,
      ...options,
    });
  },

  /** 发起自定义请求 */
  request: (options: RequestOptions & { url: string }): Promise<HttpResponse> => {
    return vokexCall('http.request', [options]);
  },
};

/**
 * Storage API 接口
 */
export interface StorageAPI {
  /** 存储数据 */
  setData: (key: string, value: any) => Promise<void>;
  /** 读取数据 */
  getData: (key: string) => Promise<any>;
  /** 获取所有键名 */
  getKeys: () => Promise<string[]>;
  /** 检查键是否存在 */
  has: (key: string) => Promise<boolean>;
  /** 删除指定键 */
  removeData: (key: string) => Promise<void>;
  /** 清空所有存储 */
  clear: () => Promise<void>;
}

/**
 * 持久化键值对存储 API
 */
export const storage: StorageAPI = {
  /** 存储数据 */
  setData: (key: string, value: any): Promise<void> => vokexCall('storage.setData', [key, value]),

  /** 读取数据 */
  getData: (key: string): Promise<any> => vokexCall('storage.getData', [key]),

  /** 获取所有键名 */
  getKeys: (): Promise<string[]> => vokexCall('storage.getKeys'),

  /** 检查键是否存在 */
  has: (key: string): Promise<boolean> => vokexCall('storage.has', [key]),

  /** 删除指定键 */
  removeData: (key: string): Promise<void> => vokexCall('storage.removeData', [key]),

  /** 清空所有存储 */
  clear: (): Promise<void> => vokexCall('storage.clear'),
};
