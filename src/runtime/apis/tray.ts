import vokexCall from "./vokexCall";
import { events } from "./events";
import type { MenuItem } from "../api";

/**
 * 托盘选项
 */
export interface TrayOptions {
  /** 图标文件路径（PNG/ICO） */
  icon: string;
  /** 鼠标悬停提示文本 */
  tooltip?: string;
  /** 托盘标题（macOS/Linux） */
  title?: string;
  /** 右键菜单 */
  menu?: MenuItem[];
}

/**
 * 气泡通知选项（暂未实现）
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
export type TrayEventType = "click" | "right-click" | "double-click";

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
    return vokexCall("tray.setToolTip", { id: this.id, text });
  }

  /** 设置托盘标题（macOS/Linux） */
  setTitle(title: string): Promise<void> {
    return vokexCall("tray.setTitle", { id: this.id, title });
  }

  /** 设置右键菜单 */
  setMenu(template: MenuItem[]): Promise<void> {
    return vokexCall("tray.setMenu", { id: this.id, menu: template });
  }

  /** 设置托盘图标 */
  setImage(icon: string): Promise<void> {
    return vokexCall("tray.setImage", { id: this.id, icon });
  }

  /** 销毁托盘图标 */
  destroy(): Promise<void> {
    return vokexCall("tray.destroy", { id: this.id });
  }

  /** 显示气泡通知（暂未实现） */
  displayBalloon(_options: BalloonOptions): Promise<void> {
    console.warn("[vokex] tray.displayBalloon 暂未实现");
    return Promise.resolve();
  }

  /** 监听托盘事件 */
  on(
    event: TrayEventType,
    callback: (data: { trayId: number; button: string }) => void
  ): () => void {
    return events.on(`tray.${event}`, callback);
  }
}

/**
 * 托盘 API 接口
 */
export interface TrayAPI {
  /** 创建系统托盘图标 */
  create: (options: TrayOptions) => Promise<Tray>;
}

/**
 * 系统托盘相关 API
 */
export const tray: TrayAPI = {
  async create(options: TrayOptions): Promise<Tray> {
    const id = await vokexCall("tray.create", options);
    return new Tray(id);
  },
};
