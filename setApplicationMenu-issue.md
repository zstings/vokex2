# setApplicationMenu 原生菜单栏问题归档

## 问题描述

在 Windows 平台上，使用 `SetMenu`（Win32 API）或 `muda::Menu::init_for_hwnd()` 挂载原生菜单栏后，菜单栏虽然被创建且客户区（client rect）已正确缩小，但菜单栏不可见——被 WebView2 的子窗口完全覆盖。

## 根本原因

wry（Tauri 底层的 WebView 库）在初始化 WebView2 时：

1. 创建一个 `WRY_WEBVIEW` 类的容器子窗口（`WS_CHILD | WS_CLIPCHILDREN`），大小等于父窗口整个客户区
2. 通过 `SetWindowSubclass` 在父窗口上安装 `parent_subclass_proc`，拦截 `WM_SIZE` 消息
3. 收到 `WM_SIZE` 时，调用 `GetClientRect` 获取客户区大小 → `controller.SetBounds()` 设置 WebView2 渲染区域 → `SetWindowPos` 调整容器窗口

**问题在于**：`SetMenu` 会改变 `GetClientRect` 的返回值（菜单栏占据空间），但 **不会触发 `WM_SIZE` 消息**。因此 wry 的 subclass proc 从未被调用，WebView2 的渲染区域和容器窗口大小保持不变，继续覆盖整个客户区（包括菜单栏所在位置）。

这是 Tauri 的已知问题：[tauri-apps/tauri#12074](https://github.com/tauri-apps/tauri/issues/12074)

## 已尝试但失败的方案

### 方案 1：muda `init_for_hwnd`
- **做法**：使用 muda 库的 `Menu::init_for_hwnd(hwnd)` 方法
- **原理**：muda 内部调用 `SetMenu` + `SetWindowSubclass` + `DrawMenuBar`
- **结果**：菜单创建成功但不可见，和纯 Win32 方案遇到同样的问题

### 方案 2：`SendMessageW(WM_SIZE)`
- **做法**：`SetMenu` 后手动发送 `WM_SIZE` 消息给父窗口
- **原理**：试图触发 wry 的 `parent_subclass_proc`
- **结果**：无效。`SendMessage` 发送的 `WM_SIZE` 可能被 tao 的事件处理拦截，或 wry 的 subclass proc 对非系统产生的 `WM_SIZE` 处理不同

### 方案 3：`MoveWindow` 调整 WebView2 子窗口
- **做法**：`SetMenu` 后用 `EnumChildWindows` 找到 `Chrome_WidgetWin_*` 等子窗口，用 `MoveWindow` 缩小
- **原理**：直接操作 WebView2 的子窗口位置
- **结果**：无效。WebView2 在下一帧渲染时会重置子窗口位置

### 方案 4：`SetWindowPos` 缩放窗口
- **做法**：`SetMenu` 后将窗口缩小 1px 再恢复原大小，试图触发系统 `WM_SIZE`
- **原理**：窗口大小变化 → 系统 `WM_SIZE` → wry 更新 WebView2
- **结果**：无效。最终大小等于原始大小，系统可能优化掉了无实际变化的 `WM_SIZE`

### 方案 5：`FindWindowExW` + `SetWindowPos` 调整 WRY_WEBVIEW 容器
- **做法**：`SetMenu` 后用 `FindWindowExW` 找到 `WRY_WEBVIEW` 容器子窗口，用 `SetWindowPos` 缩小到新客户区大小
- **原理**：绕过 wry 的 subclass proc，直接调整容器窗口
- **结果**：无效。容器窗口位置改变后，WebView2 内部的渲染仍然覆盖整个区域（因为 `controller.SetBounds()` 未被调用，WebView2 的渲染边界未更新）

### 方案 6：COM 虚表调用 `controller.SetBounds()`
- **做法**：通过 `GetWindowSubclass` 获取 wry 存储的 `ICoreWebView2Controller` 指针，直接通过 COM 虚表调用 `SetBounds`
- **原理**：完全复现 wry 的 `parent_subclass_proc` 中 `WM_SIZE` 的处理逻辑
- **结果**：应用崩溃（退出码 `0xC0000409`）。COM 虚表调用的参数传递方式（RECT 结构体在 x64 ABI 中的传递约定）不正确

## 可能的解决方向（未验证）

1. **使用 `windows` crate 的 COM 绑定**：不通过原始虚表调用，而是引入 `webview2-com` crate，正确调用 `ICoreWebView2Controller::SetBounds`
2. **修改 wry 源码**：在 wry 的 `parent_subclass_proc` 中增加对 `WM_NCCALCSIZE` 或自定义消息的处理，或在 `SetMenu` 后主动调用 `resize_to_parent`
3. **使用 tao 的菜单支持**：tao 本身有 `Menu` 类型，但 Tauri/wry 的 WebView2 覆盖问题同样存在
4. **使用 WebView2 的 `AreNonClientRegionSupportEnabled`**：wry 已启用此设置（`settings9.SetIsNonClientRegionSupportEnabled(true)`），但可能需要配合其他设置

## 当前状态

**暂时搁置**。`setApplicationMenu` API 在 Rust 端直接返回"待实现"，TS 端保留 API 名称。右键菜单（`setContextMenu`，使用 muda）功能正常，不受影响。
