import vokexCall from "./vokexCall";

/**
 * CpuUsage CPU 使用率
 */
export interface CpuUsage {
    /** 用户态 CPU 时间（秒） */
    user: number;
    /** 内核态 CPU 时间（秒） */
    system: number;
}

/**
 * MemoryInfo 内存信息
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
 * 进程 API 接口
 */
export interface ProcessAPI {
    /** 获取系统运行时长（秒） */
    getUptime: () => Promise<number>;
    /** 获取 CPU 使用率 */
    getCpuUsage: () => Promise<CpuUsage>;
    /** 获取内存信息 */
    getMemoryInfo: () => Promise<MemoryInfo>;
    /** 获取主机名 */
    hostname: () => Promise<string>;
    /** 获取所有环境变量 */
    env: () => Promise<Record<string, string>>;
    /** 终止指定进程 */
    kill: (pid: number) => Promise<void>;
}

/**
 * 进程与系统运行时信息 API
 */
export const process: ProcessAPI = {
    /**
     * 获取系统运行时长（秒）
     */
    getUptime: (): Promise<number> => vokexCall('process.getUptime', {}),

    /**
     * 获取 CPU 使用率
     */
    getCpuUsage: (): Promise<CpuUsage> => vokexCall('process.getCpuUsage', {}),

    /**
     * 获取内存信息
     */
    getMemoryInfo: (): Promise<MemoryInfo> => vokexCall('process.getMemoryInfo', {}),

    /**
     * 获取主机名
     */
    hostname: (): Promise<string> => vokexCall('process.hostname', {}),

    /**
     * 获取所有环境变量
     */
    env: (): Promise<Record<string, string>> => vokexCall('process.env', {}),

    /**
     * 终止指定进程
     * @param pid 进程 ID
     */
    kill: (pid: number): Promise<void> => vokexCall('process.kill', { pid }),
};