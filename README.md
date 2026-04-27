# Vokex

[![npm version](https://img.shields.io/npm/v/vokex)](https://www.npmjs.com/package/vokex)
[![license](https://img.shields.io/npm/l/vokex)](LICENSE)

超轻量级桌面应用构建库。Vite 构建后一键打包为原生可执行文件。

## 特性

- **超轻量**：构建产物最小 ~1.8MB，仅依赖系统 WebView
- **零 Rust 门槛**：`npm install vokex` 即可使用，不需要 Rust 工具链
- **Vite 原生集成**：Vite 插件自动接管构建流程
- **单文件输出**：前端资源嵌入到可执行文件中
- **双模式运行**：开发时在浏览器中调试，生产时在原生壳中运行
- **丰富的 API**：窗口、文件系统、系统信息、进程管理、网络请求等
- **跨平台**：支持 Windows、macOS、Linux
- **TypeScript 优先**：完整的类型支持

## 快速开始

### 1. 创建项目

```bash
# 使用 Vite 创建新项目
npm create vite@latest my-app -- --template vanilla
cd my-app

# 安装 vokex
npm install vokex.app
```

### 2. 安装依赖

vokex 需要 Vite 作为 peer dependency，确保已安装：

```bash
npm install vite@^8.0.0
```

### 3. 配置 Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { vokexPlugin } from "vokex/vite-plugin";

export default defineConfig({
  plugins: [
    vokexPlugin({
      // 应用基本信息
      name: "我的应用",
      identifier: "com.example.myapp",
      version: "1.0.0",
      icon: "public/icon.png", // 可选，应用图标路径
      
      // 窗口配置
      window: {
        title: "我的应用",
        width: 1200,
        height: 800,
      },
      
      // 开发工具配置
      devtools: process.env.NODE_ENV === 'development', // 开发模式下启用开发者工具
      verbose: false, // 是否显示详细日志
    }),
  ],
});
```

### 4. 使用 API

```typescript
import { 
  app, 
  browserWindow, 
  fs, 
  process, 
  computer, 
  http, 
  storage,
  dialog,
  clipboard,
  notification,
  shell,
  menu
} from "vokex";

// 应用信息
const appName = await app.getName();
const appVersion = await app.getVersion();
const appPath = await app.getAppPath();
const platform = await app.getPlatform();

// 窗口管理
const mainWindow = await browserWindow.create({
  title: "我的窗口",
  width: 800,
  height: 600,
  center: true
});

// 文件系统操作
const content = await fs.readFile("config.json");
await fs.writeFile("output.txt", "Hello World");
const files = await fs.readDir("./");
const fileExists = await fs.exists("somefile.txt");

// 系统信息
const cpuInfo = await computer.getCpuInfo();
const memoryInfo = await process.getMemoryInfo();
const osInfo = await computer.getOsInfo();
const uptime = await process.getUptime();

// HTTP 请求
const response = await http.get("https://api.example.com/data", {
  headers: { "User-Agent": "vokex-app" }
});
const postResult = await http.post("https://api.example.com/submit", 
  { key: "value" },
  { headers: { "Content-Type": "application/json" } }
);

// 本地存储
await storage.setData("user", { name: "张三", age: 25 });
const user = await storage.getData("user");
const keys = await storage.getKeys();

// 对话框
const result = await dialog.showOpenDialog({
  title: "选择文件",
  filters: [{ name: "文本文件", extensions: ["txt", "md"] }],
  multiple: false
});

// 剪贴板
await clipboard.writeText("复制到剪贴板的内容");
const clipboardText = await clipboard.readText();

// 系统通知
await notification.show({
  title: "通知标题",
  body: "通知内容",
  icon: "icon.png"
});

// 系统命令
await shell.openExternal("https://example.com");
await shell.trashItem("trashfile.txt");
```

### 5. 构建打包

```bash
npm run build
# 即 vite build，Vite 构建完成后，vokex 插件自动将 dist/ 嵌入到可执行文件
# 输出到 release/ 目录
```

### 6. 开发模式

```bash
npm run dev
# 即 vite，Vite 开发服务器启动后，vokex 插件自动启动原生壳
```

### 7. 验证构建产物

```bash
npx vokex validate release/我的应用.exe
# 验证二进制文件是否为有效的 vokex 应用
```

## 架构

```
┌─────────────────────────────────┐
│  前端代码 (HTML/JS/CSS)          │
│  import { app, fs, http } from "vokex" │
├─────────────────────────────────┤
│  运行时 Bridge (注入 JS)         │
│  window.__VOKEX__.call("fs.read")   │
├─────────────────────────────────┤
│  IPC: postMessage ↔ evaluate    │
├─────────────────────────────────┤
│  Rust 壳 (wry + tao)            │
│  窗口管理 | API 路由 | 资源加载   │
├─────────────────────────────────┤
│  系统 WebView                   │
│  Windows: WebView2              │
│  macOS: WKWebView               │
└─────────────────────────────────┘
```

## 资源嵌入格式

二进制文件尾部追加：

```
[MAGIC(5B)] [索引长度(4B)] [索引JSON] [zlib压缩数据] [偏移量(8B)]
```

索引格式：`{ "index.html": [offset, length], "assets/main.js": [offset, length] }`

## 编译壳

如果你需要自己编译壳（而不是使用预编译版本）：

```bash
cd shell
cargo build --release
# 输出: shell/target/release/vokex-shell.exe (Windows)
#       shell/target/release/vokex-shell     (macOS/Linux)
```

## API 参考

vokex 提供了丰富的 API 用于桌面应用开发。所有 API 都是异步的，返回 Promise。

### app - 应用管理
`quit()` `exit(code)` `restart()` `getAppPath()` `getPath(name)` `getVersion()` `getName()` `getIdentifier()` `getLocale()` `getPid()` `getArgv()` `getEnv(key)` `getPlatform()` `getArch()` `requestSingleInstanceLock()` `on(event, callback)`

### browserWindow - 窗口管理
**静态方法：** `create(options)` `getAll()` `getFocused()` `getById(id)` `getWindow(id)` `getCurrentWindow()` `getFocusedWindow()`

**实例方法：** `close()` `show()` `hide()` `minimize()` `maximize()` `unmaximize()` `restore()` `focus()` `blur()` `isMaximized()` `isMinimized()` `isFullScreen()` `setFullScreen(flag)` `setTitle(title)` `getTitle()` `setSize(width, height)` `getSize()` `setMinimumSize(width, height)` `setMaximumSize(width, height)` `setResizable(flag)` `setAlwaysOnTop(flag)` `setPosition(x, y)` `getPosition()` `center()` `setOpacity(opacity)` `setBackgroundColor(color)` `setIcon(icon)` `loadFile(path)` `loadURL(url)` `reload()` `setProgressBar(progress)` `setSkipTaskbar(flag)` `flashTaskbar(flag)` `on(event, callback)` `off(event, callback)`

### dialog - 对话框
`showMessageBox(options)` `showOpenDialog(options)` `showSaveDialog(options)`

### menu - 菜单
`setContextMenu(template)` `onMenuClick(callback)`

### clipboard - 剪贴板
`readText()` `writeText(text)` `clear()`

### notification - 系统通知
`show(options)`

### fs - 文件系统
`readFile(path)` `readFileBinary(path)` `writeFile(path, data)` `appendFile(path, data)` `deleteFile(path)` `readDir(path)` `createDir(path)` `removeDir(path)` `stat(path)` `exists(path)` `copyFile(source, destination)` `moveFile(source, destination)`

### shell - 系统命令
`openExternal(url)` `openPath(path)` `execCommand(command, options?)` `trashItem(path)`

### process - 进程管理
`getUptime()` `getCpuUsage()` `getMemoryInfo()` `hostname()` `env(key)` `kill(pid, signal?)`

### computer - 系统硬件信息
`getCpuInfo()` `getOsInfo()` `getDisplays()` `getMousePosition()` `getKeyboardLayout()`

> **注意：** `getMousePosition()` `getKeyboardLayout()` `getDisplays()` 仅 Windows 平台实现

### http - 网络请求
`get(url, options?)` `post(url, data, options?)` `put(url, data, options?)` `delete(url, options?)` `request(options)`

### storage - 本地存储
`setData(key, value)` `getData(key)` `getKeys()` `has(key)` `removeData(key)` `clear()`

### events - 事件总线
`on(event, callback)` `off(event, callback)` `emit(event, data)`



## 类型定义

```typescript
// 文件系统
interface DirEntry {
  name: string;
  isDir: boolean;
}

interface FileInfo {
  isFile: boolean;
  isDir: boolean;
  size: number;
  modified: number;
}

// HTTP
interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

interface HttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  ok: boolean;
}

// 计算机信息
interface CpuInfo {
  manufacturer: string;
  model: string;
  cores: number;
  logicalProcessors: number;
  architecture: string;
}

interface OsInfo {
  name: string;
  version: string;
  platform: string;
  arch: string;
}

interface Display {
  id: string;
  name: string;
  width: number;
  height: number;
  scaleFactor: number;
  isPrimary: boolean;
}

// 进程
interface CpuUsage {
  user: number;
  system: number;
}

interface ProcessMemoryInfo {
  rss: number;
  heapTotal: number;
}

// Shell
interface ShellResult {
  code: number;
  stdout: string;
  stderr: string;
  success: boolean;
}

interface ExecOptions {
  cwd?: string;
  env?: Record<string, string>;
}
```

## 问题反馈

如果您遇到问题或有功能建议：

1. 搜索现有的 [Issues](https://github.com/your-repo/vokex/issues)
2. 如果问题未解决，请创建新的 Issue，包含：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（操作系统、Node.js 版本等）

## 许可证

MIT
