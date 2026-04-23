import vokexCall from "./vokexCall";

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
  openExternal: (url: string): Promise<void> => vokexCall('shell.openExternal', { url }),

  /**
   * 用系统默认程序打开文件/目录
   * @param path 文件或目录路径
   */
  openPath: (path: string): Promise<void> => vokexCall('shell.openPath', { path }),

  /**
   * 执行系统命令
   * @param command 要执行的命令字符串
   * @param options 执行选项（可选）
   */
  execCommand: (command: string, options?: ExecOptions): Promise<ShellResult> =>
    vokexCall('shell.execCommand', { command, ...options }),

  /**
   * 将文件移到回收站
   * @param path 要移动的文件路径
   */
  trashItem: (path: string): Promise<void> => vokexCall('shell.trashItem', { path }),
};