import { app, notification, process, computer, http, browserWindow, BrowserWindow, menu, tray, Tray } from "vokex";

import { log, clear } from './utils'

document.getElementById("btn-notification")?.addEventListener("click", async () => {
  clear();
  log("=== 系统通知测试 ===");
  
  try {
    log("正在发送通知...");
    await notification.show({
      title: "Vokex 通知",
      body: "这是一条来自 Vokex 应用的系统通知！",
    });
    log("✅ 通知已发送");
  } catch (error: any) {
    log(`错误: ${error.message || error}`);
    console.error("Notification error:", error);
  }
});

// ==================== Computer API 测试 ====================

document.getElementById("btn-computer-cpu")?.addEventListener("click", async () => {
  clear();
  log("=== computer.getCpuInfo() ===");
  try {
    const cpu = await computer.getCpuInfo();
    log(`逻辑处理器数量: ${cpu.logicalProcessors}`);
    log(`架构: ${cpu.architecture}`);
    log(`制造商: ${cpu.manufacturer || '(未获取)'}`);
    log(`型号: ${cpu.model || '(未获取)'}`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-computer-memory")?.addEventListener("click", async () => {
  clear();
  log("=== computer.getMemoryInfo() ===");
  try {
    const mem = await computer.getMemoryInfo();
    const totalGB = (mem.total / 1024 / 1024 / 1024).toFixed(2);
    const availableGB = (mem.available / 1024 / 1024 / 1024).toFixed(2);
    const usedGB = (mem.used / 1024 / 1024 / 1024).toFixed(2);
    const usedPercent = ((mem.used / mem.total) * 100).toFixed(1);
    log(`总内存: ${totalGB} GB`);
    log(`可用内存: ${availableGB} GB`);
    log(`已用内存: ${usedGB} GB (${usedPercent}%)`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-computer-os")?.addEventListener("click", async () => {
  clear();
  log("=== computer.getOsInfo() ===");
  try {
    const os = await computer.getOsInfo();
    log(`名称: ${os.name}`);
    log(`版本: ${os.version}`);
    log(`平台: ${os.platform}`);
    log(`架构: ${os.arch}`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-computer-displays")?.addEventListener("click", async () => {
  clear();
  log("=== computer.getDisplays() ===");
  try {
    const displays = await computer.getDisplays();
    log(`检测到 ${displays.length} 台显示器:`);
    displays.forEach((d, i) => {
      log(`  [${i}] ${d.name.trim() || `Display ${d.id}`}: ${d.width}x${d.height} ${d.isPrimary ? '(主显示器)' : ''}`);
    });
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-computer-mouse")?.addEventListener("click", async () => {
  clear();
  log("=== computer.getMousePosition() ===");
  try {
    const pos = await computer.getMousePosition();
    log(`鼠标当前位置: x=${pos.x}, y=${pos.y}`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-computer-keyboard")?.addEventListener("click", async () => {
  clear();
  log("=== computer.getKeyboardLayout() ===");
  try {
    const layout = await computer.getKeyboardLayout();
    log(`当前键盘布局: ${layout}`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

log("页面已加载");

// ==================== BrowserWindow API 测试 ====================

let mainWindow: BrowserWindow | null = null;

document.getElementById("btn-win-get-main")?.addEventListener("click", async () => {
  clear();
  log("=== browserWindow.getMainWindow() ===");
  try {
    mainWindow = await browserWindow.getMainWindow();
    if (mainWindow) {
      log(`✅ 获取到主窗口，ID: ${mainWindow.getId()}`);
      const title = await mainWindow.getTitle();
      log(`窗口标题: ${title}`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-get-all")?.addEventListener("click", async () => {
  clear();
  log("=== browserWindow.getAll() ===");
  try {
    const windows = await browserWindow.getAll();
    log(`共有 ${windows.length} 个窗口:`);
    windows.forEach((win, i) => {
      log(`  [${i}] ID: ${win.id}, 标题: ${win.title}`);
      log(`       大小: ${win.width}x${win.height}, 位置: (${win.x}, ${win.y})`);
      log(`       最大化: ${win.is_maximized}, 最小化: ${win.is_minimized}, 全屏: ${win.is_fullscreen}`);
      log(`       聚焦: ${win.is_focused}, 可见: ${win.is_visible}`);
    });
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-get-focused")?.addEventListener("click", async () => {
  clear();
  log("=== browserWindow.getFocused() ===");
  try {
    const focused = await browserWindow.getFocused();
    if (focused) {
      log(`✅ 当前聚焦窗口 ID: ${focused.id}`);
      log(`标题: ${focused.title}`);
    } else {
      log("⚠️ 没有窗口处于聚焦状态");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-set-title")?.addEventListener("click", async () => {
  clear();
  log("=== win.setTitle() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      const newTitle = `Vokex - ${new Date().toLocaleTimeString()}`;
      await mainWindow.setTitle(newTitle);
      log(`✅ 窗口标题已设置为: ${newTitle}`);
      const title = await mainWindow.getTitle();
      log(`当前标题: ${title}`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-get-size")?.addEventListener("click", async () => {
  clear();
  log("=== win.getSize() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      const size = await mainWindow.getSize();
      log(`窗口大小: ${size[0]} x ${size[1]}`);
      const pos = await mainWindow.getPosition();
      log(`窗口位置: (${pos[0]}, ${pos[1]})`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-set-size")?.addEventListener("click", async () => {
  clear();
  log("=== win.setSize() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      const width = 800 + Math.floor(Math.random() * 200);
      const height = 600 + Math.floor(Math.random() * 200);
      await mainWindow.setSize(width, height);
      log(`✅ 窗口大小已设置为: ${width} x ${height}`);
      const size = await mainWindow.getSize();
      log(`实际大小: ${size[0]} x ${size[1]}`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-center")?.addEventListener("click", async () => {
  clear();
  log("=== win.center() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      await mainWindow.center();
      log("✅ 窗口已居中");
      const pos = await mainWindow.getPosition();
      log(`新位置: (${pos[0]}, ${pos[1]})`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-minimize")?.addEventListener("click", async () => {
  clear();
  log("=== win.minimize() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      await mainWindow.minimize();
      log("✅ 窗口已最小化");
      const isMinimized = await mainWindow.isMinimized();
      log(`最小化状态: ${isMinimized}`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-maximize")?.addEventListener("click", async () => {
  clear();
  log("=== win.maximize() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      await mainWindow.maximize();
      log("✅ 窗口已最大化");
      const isMaximized = await mainWindow.isMaximized();
      log(`最大化状态: ${isMaximized}`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-restore")?.addEventListener("click", async () => {
  clear();
  log("=== win.restore() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      await mainWindow.restore();
      log("✅ 窗口已恢复");
      const isMinimized = await mainWindow.isMinimized();
      const isMaximized = await mainWindow.isMaximized();
      log(`最小化: ${isMinimized}, 最大化: ${isMaximized}`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-fullscreen")?.addEventListener("click", async () => {
  clear();
  log("=== win.setFullScreen() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      const isFullScreen = await mainWindow.isFullScreen();
      log(`当前全屏状态: ${isFullScreen}`);
      await mainWindow.setFullScreen(!isFullScreen);
      log(`✅ 全屏状态已切换为: ${!isFullScreen}`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-always-on-top")?.addEventListener("click", async () => {
  clear();
  log("=== win.setAlwaysOnTop() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      await mainWindow.setAlwaysOnTop(true);
      log("✅ 窗口已设置为置顶");
      log("提示: 3秒后取消置顶");
      setTimeout(async () => {
        await mainWindow?.setAlwaysOnTop(false);
        log("✅ 置顶已取消");
      }, 3000);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-set-position")?.addEventListener("click", async () => {
  clear();
  log("=== win.setPosition() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      const x = 100 + Math.floor(Math.random() * 200);
      const y = 100 + Math.floor(Math.random() * 200);
      await mainWindow.setPosition(x, y);
      log(`✅ 窗口位置已设置为: (${x}, ${y})`);
      const pos = await mainWindow.getPosition();
      log(`实际位置: (${pos[0]}, ${pos[1]})`);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-set-resizable")?.addEventListener("click", async () => {
  clear();
  log("=== win.setResizable() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      await mainWindow.setResizable(false);
      log("✅ 窗口已设置为不可调整大小");
      log("提示: 10秒后恢复可调整大小");
      setTimeout(async () => {
        await mainWindow?.setResizable(true);
        log("✅ 窗口已恢复可调整大小");
      }, 10000);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-set-opacity")?.addEventListener("click", async () => {
  clear();
  log("=== win.setOpacity() [Windows] ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      const opacity = 0.5;
      await mainWindow.setOpacity(opacity);
      log(`✅ 窗口透明度已设置为: ${opacity}`);
      log("提示: 3秒后恢复不透明");
      setTimeout(async () => {
        await mainWindow?.setOpacity(1.0);
        log("✅ 窗口已恢复不透明");
      }, 3000);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
    log("提示: setOpacity 仅在 Windows 和 macOS 上可用");
  }
});

document.getElementById("btn-win-set-progress")?.addEventListener("click", async () => {
  clear();
  log("=== win.setProgressBar() [Windows] ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      const progress = 0.5;
      await mainWindow.setProgressBar(progress);
      log(`✅ 任务栏进度条已设置为: ${progress * 100}%`);
      log("提示: 3秒后隐藏进度条");
      setTimeout(async () => {
        await mainWindow?.setProgressBar(-1);
        log("✅ 进度条已隐藏");
      }, 3000);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
    log("提示: setProgressBar 仅在 Windows 和 macOS 上可用");
  }
});

document.getElementById("btn-win-reload")?.addEventListener("click", async () => {
  clear();
  log("=== win.reload() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      await mainWindow.reload();
      log("✅ 窗口已重新加载");
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-hide-show")?.addEventListener("click", async () => {
  clear();
  log("=== win.hide() / win.show() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getMainWindow();
    }
    if (mainWindow) {
      await mainWindow.hide();
      log("✅ 窗口已隐藏");
      log("提示: 2秒后显示窗口");
      setTimeout(async () => {
        await mainWindow?.show();
        log("✅ 窗口已显示");
      }, 2000);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

// ==================== Menu API 测试 ====================

document.getElementById("btn-menu-set")?.addEventListener("click", async () => {
  clear();
  log("=== menu.setApplicationMenu() ===");
  try {
    await menu.setApplicationMenu([
      {
        type: "submenu",
        label: "文件",
        submenu: [
          { type: "normal", id: "new", label: "新建", accelerator: "Ctrl+N" },
          { type: "normal", id: "open", label: "打开", accelerator: "Ctrl+O" },
          { type: "separator" },
          { type: "normal", id: "save", label: "保存", accelerator: "Ctrl+S" },
          { type: "separator" },
          { type: "native", nativeLabel: "quit" },
        ],
      },
      {
        type: "submenu",
        label: "编辑",
        submenu: [
          { type: "native", nativeLabel: "undo" },
          { type: "native", nativeLabel: "redo" },
          { type: "separator" },
          { type: "native", nativeLabel: "cut" },
          { type: "native", nativeLabel: "copy" },
          { type: "native", nativeLabel: "paste" },
          { type: "native", nativeLabel: "selectAll" },
        ],
      },
      {
        type: "submenu",
        label: "视图",
        submenu: [
          { type: "checkbox", id: "dark-mode", label: "深色模式", checked: false },
          { type: "separator" },
          { type: "normal", id: "fullscreen", label: "全屏", accelerator: "F11" },
        ],
      },
      {
        type: "submenu",
        label: "帮助",
        submenu: [
          { type: "normal", id: "about", label: "关于 Vokex" },
        ],
      },
    ]);
    log("✅ 菜单栏已设置");
    log("  文件: 新建/打开/保存/退出");
    log("  编辑: 撤销/重做/剪切/复制/粘贴/全选");
    log("  视图: 深色模式(复选框)/全屏");
    log("  帮助: 关于");
    log("  提示: 点击菜单项会触发 menu.clicked 事件");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-menu-remove")?.addEventListener("click", async () => {
  clear();
  log("=== 移除菜单栏 ===");
  try {
    await menu.setApplicationMenu([]);
    log("✅ 菜单栏已移除（设置空菜单）");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-menu-listen")?.addEventListener("click", async () => {
  clear();
  log("=== 监听菜单点击事件 ===");
  try {
    menu.on("clicked", ({ menuId }) => {
      log(`📢 菜单点击: id = "${menuId}"`);

      // 根据菜单 ID 执行对应操作
      switch (menuId) {
        case "new":
          log("  → 新建文件");
          break;
        case "open":
          log("  → 打开文件");
          break;
        case "save":
          log("  → 保存文件");
          break;
        case "fullscreen":
          log("  → 切换全屏");
          break;
        case "about":
          log("  → Vokex 桌面应用框架 v0.1.0");
          break;
        default:
          log(`  → 未处理的菜单项: ${menuId}`);
      }
    });
    log("✅ 菜单事件监听已注册");
    log("  提示: 现在点击菜单项，事件会显示在此处");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

// ==================== Tray API 测试 ====================

let currentTray: Tray | null = null;

document.getElementById("btn-tray-create")?.addEventListener("click", async () => {
  clear();
  log("=== tray.create() ===");
  try {
    // 获取应用路径来定位图标
    const appPath = await app.getAppPath();
    log(`应用路径: ${appPath}`);
    log("正在创建系统托盘图标...");

    // 尝试使用应用目录下的 icon.png，如果不存在则使用空路径（会报错）
    const iconPath = `${appPath}\\icon.png`;
    log(`图标路径: ${iconPath}`);

    currentTray = await tray.create({
      icon: iconPath,
      tooltip: "Vokex Demo - 系统托盘",
      menu: [
        { type: "normal", id: "tray-show", label: "显示窗口" },
        { type: "separator" },
        { type: "normal", id: "tray-about", label: "关于" },
        { type: "separator" },
        { type: "normal", id: "tray-quit", label: "退出" },
      ],
    });

    log(`✅ 托盘已创建，ID: ${currentTray.getId()}`);
    log("  提示: 查看系统托盘区域，应该能看到图标");
    log("  提示: 右键托盘图标可看到菜单");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
    log("  提示: 请确保 icon.png 文件存在于应用目录中");
    log("  提示: 可以用任意 32x32 PNG 图标测试");
  }
});

document.getElementById("btn-tray-set-tooltip")?.addEventListener("click", async () => {
  clear();
  log("=== tray.setToolTip() ===");
  try {
    if (!currentTray) {
      log("⚠️ 请先创建托盘");
      return;
    }
    const tooltip = `Vokex Demo - ${new Date().toLocaleTimeString()}`;
    await currentTray.setToolTip(tooltip);
    log(`✅ 提示文本已设置为: ${tooltip}`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-tray-set-menu")?.addEventListener("click", async () => {
  clear();
  log("=== tray.setMenu() ===");
  try {
    if (!currentTray) {
      log("⚠️ 请先创建托盘");
      return;
    }
    await currentTray.setMenu([
      { type: "normal", id: "tray-show", label: "显示窗口" },
      { type: "checkbox", id: "tray-auto-start", label: "开机自启", checked: true },
      { type: "separator" },
      { type: "normal", id: "tray-settings", label: "设置..." },
      { type: "separator" },
      { type: "normal", id: "tray-quit", label: "退出" },
    ]);
    log("✅ 托盘菜单已更新");
    log("  新增: 开机自启(复选框)、设置");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-tray-destroy")?.addEventListener("click", async () => {
  clear();
  log("=== tray.destroy() ===");
  try {
    if (!currentTray) {
      log("⚠️ 托盘不存在");
      return;
    }
    await currentTray.destroy();
    log("✅ 托盘已销毁");
    currentTray = null;
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-tray-listen")?.addEventListener("click", async () => {
  clear();
  log("=== 监听托盘事件 ===");
  try {
    tray.on("click", ({ trayId }) => {
      log(`📢 托盘左键点击: trayId = ${trayId}`);
    });
    tray.on("right-click", ({ trayId }) => {
      log(`📢 托盘右键点击: trayId = ${trayId}`);
    });
    tray.on("double-click", ({ trayId }) => {
      log(`📢 托盘双击: trayId = ${trayId}`);
    });

    // 同时监听托盘菜单点击
    menu.on("clicked", ({ menuId }) => {
      if (menuId.startsWith("tray-")) {
        log(`📢 托盘菜单点击: ${menuId}`);
        switch (menuId) {
          case "tray-show":
            log("  → 显示窗口");
            break;
          case "tray-quit":
            log("  → 退出应用");
            break;
          case "tray-settings":
            log("  → 打开设置");
            break;
        }
      }
    });

    log("✅ 托盘事件监听已注册");
    log("  监听: click / right-click / double-click");
    log("  提示: 点击托盘图标，事件会显示在此处");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});
