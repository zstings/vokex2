import vokexCall from "./vokexCall";

/** CPU 硬件信息 */
export interface CpuInfo {
    manufacturer: string;
    model: string;
    cores: number;
    logicalProcessors: number;
    architecture: string;
    frequency: number;
}

/** 操作系统信息 */
export interface OsInfo {
    name: string;
    version: string;
    longVersion: string;
    kernelVersion: string;
    platform: string;
    arch: string;
}

/** 鼠标位置 */
export interface MousePosition {
    x: number;
    y: number;
}

/** 键盘布局 */
export interface KeyboardLayout {
    layout: string;
}

/** 单个显示器信息 */
export interface DisplayInfo {
    name: string | null;
    width: number;
    height: number;
    x: number;
    y: number;
    scaleFactor: number;
    isPrimary: boolean;
}

/** 显示器列表 */
export interface DisplaysInfo {
    displays: DisplayInfo[];
    primary: string | null;
}

export interface ComputerAPI {
    /** 获取 CPU 硬件信息 */
    getCpuInfo(): Promise<CpuInfo>;
    /** 获取操作系统信息 */
    getOsInfo(): Promise<OsInfo>;
    /** 获取鼠标当前位置（屏幕像素坐标） */
    getMousePosition(): Promise<MousePosition>;
    /** 获取当前键盘布局（BCP-47 格式，如 "en-US"、"zh-CN"） */
    getKeyboardLayout(): Promise<KeyboardLayout>;
    /** 获取所有显示器信息 */
    getDisplays(): Promise<DisplaysInfo>;
}

/**
 * Computer API
 */
export const computer: ComputerAPI = {
    /**
     * 获取 CPU 硬件信息
     */
    getCpuInfo: (): Promise<CpuInfo> => vokexCall('computer.getCpuInfo', {}),

    /**
     * 获取操作系统信息
     */
    getOsInfo: (): Promise<OsInfo> => vokexCall('computer.getOsInfo', {}),

    /**
     * 获取鼠标当前位置（屏幕像素坐标）
     */
    getMousePosition: (): Promise<MousePosition> => vokexCall('computer.getMousePosition', {}),

    /**
     * 获取当前键盘布局（BCP-47 格式，如 "en-US"、"zh-CN"）
     */
    getKeyboardLayout: (): Promise<KeyboardLayout> => vokexCall('computer.getKeyboardLayout', {}),

    /**
     * 获取所有显示器信息
     */
    getDisplays: (): Promise<DisplaysInfo> => vokexCall('computer.getDisplays', {}),
};