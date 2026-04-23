/**
 * vokex 框架 - 运行时 API 入口（浏览器环境）
 */

// 运行时 API
export { app, process, fs, shell, dialog, clipboard, notification, events, call, computer, http, storage, browserWindow, BrowserWindow, menu, tray, Tray } from "./runtime/api";
export type { NotificationOptions, DirEntry, FileInfo, FsAPI, CpuUsage, MemoryInfo, ProcessAPI, ExecOptions, ShellResult, ShellAPI, CpuInfo, MemoryInfo as ComputerMemoryInfo, OsInfo, Display, ComputerAPI, RequestOptions, HttpResponse, HttpAPI, StorageAPI, WindowOptions, WindowInfo, WindowEventType, MenuItem, MenuItemType, NativeLabel, MenuAPI, TrayOptions, BalloonOptions, TrayEventType, TrayAPI } from "./runtime/api";
