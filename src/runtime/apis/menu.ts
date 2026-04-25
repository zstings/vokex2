import { events } from "./events";
import vokexCall from "./vokexCall";



/**
 * 原生菜单项标签
 */
export type NativeLabel =
  | 'separator' | 'copy' | 'cut' | 'paste' | 'selectAll'
  | 'undo' | 'redo' | 'minimize' | 'maximize' | 'fullscreen'
  | 'hide' | 'hideOthers' | 'showAll' | 'closeWindow'
  | 'quit' | 'about' | 'services' | 'bringAllToFront';

/**
 * 菜单项类型
 */
export interface MenuItem {
    /** 菜单项 ID，用于点击事件识别 */
    id?: string;
    /** 显示文本 */
    label?: string;
    /** 菜单项类型 */
    type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'native';
    /** 是否启用 */
    enabled?: boolean;
    /** 是否选中（仅 checkbox） */
    checked?: boolean;
    /** 子菜单（仅 submenu） */
    submenu?: MenuItem[];
    /** 原生菜单项标签（native 类型） */
    nativeLabel?: NativeLabel;
}

/**
 * Menu API
 */
export interface MenuAPI {
    /** 设置应用顶部菜单栏 */
    setApplicationMenu(menu: MenuItem[]): Promise<void>;
    /** 设置右键上下文菜单 */
    setContextMenu(menu: MenuItem[], x?: number, y?: number): Promise<void>;
    /** 移除右键上下文菜单 */
    removeContextMenu: () => Promise<void>;
    /** 监听菜单点击事件 */
    onMenuClick: (callback: (data: { id: string; }) => void) => void;
}

/**
 * Menu API
 */
export const menu: MenuAPI = {
    /**
     * 设置应用顶部菜单栏
     */
    setApplicationMenu: (menuItems: MenuItem[]): Promise<void> => vokexCall('menu.setApplicationMenu', { menu: menuItems }),

    /**
     * 设置右键上下文菜单
     */
    setContextMenu: (menuItems: MenuItem[], x?: number, y?: number): Promise<void> => vokexCall('menu.setContextMenu', { menu: menuItems, x, y }),
    /**
     * 移除右键上下文菜单
     */
    removeContextMenu: (): Promise<void> => vokexCall('menu.removeContextMenu'),
    /** 
     * 监听菜单点击事件
     */
    onMenuClick: (callback: (data: { id: string }) => void) => events.on(`menu.click`, callback),
};