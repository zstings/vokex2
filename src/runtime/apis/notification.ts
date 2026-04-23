import vokexCall from "./vokexCall";

/**
 * NotificationOptions 通知选项
 */
export interface NotificationOptions {
    /** 通知标题 */
    title: string;
    /** 通知内容 */
    body?: string;
}

/**
 * Notification API 接口
 */
export interface NotificationAPI {
    /** 显示系统通知 */
    show: (options: NotificationOptions) => Promise<void>;
}

/**
 * 系统通知 API
 */
export const notification: NotificationAPI = {
    /**
     * 显示系统通知
     * @param options 通知选项
     */
    show: (options: NotificationOptions): Promise<void> =>
        vokexCall('notification.show', options),
};