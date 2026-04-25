import { browserWindow } from "vokex";

import { log, clear } from './utils'

log("页面已加载");

let mainWindow: any | null = null;

document.getElementById("btn-win-create")?.addEventListener("click", async () => {
  clear();
  log("=== browserWindow.create() ===");
  try {
    const newWin = await browserWindow.create({
      title: `新窗口 - ${new Date().toLocaleTimeString()}`,
      width: 600,
      height: 400,
    });
    log(`✅ 新窗口已创建，ID: ${newWin.getId()}`);
    const allWindows = await browserWindow.getAll();
    log(`当前共有 ${allWindows.length} 个窗口`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-set-min-size")?.addEventListener("click", async () => {
  clear();
  log("=== win.setMinimumSize() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getCurrentWindow();
    }
    if (mainWindow) {
      await mainWindow.setMinimumSize(400, 300);
      log("✅ 最小窗口尺寸已设置为: 400 x 300");
      log("提示: 尝试拖动窗口边缘缩小，无法小于该尺寸");
      log("提示: 10秒后取消限制");
      setTimeout(async () => {
        await mainWindow?.setMinimumSize(0, 0);
        log("✅ 最小尺寸限制已取消");
      }, 10000);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-set-bg-color")?.addEventListener("click", async () => {
  clear();
  log("=== win.setBackgroundColor() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getCurrentWindow();
    }
    if (mainWindow) {
      const color = "#ff6600";
      await mainWindow.setBackgroundColor(color);
      log(`✅ 背景色已设置为: ${color}`);
      log("提示: 3秒后恢复白色");
      setTimeout(async () => {
        await mainWindow?.setBackgroundColor("#ffffff");
        log("✅ 背景色已恢复");
      }, 3000);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-skip-taskbar")?.addEventListener("click", async () => {
  clear();
  log("=== win.setSkipTaskbar() [Windows] ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getCurrentWindow();
    }
    if (mainWindow) {
      await mainWindow.setSkipTaskbar(true);
      log("✅ 窗口已从任务栏隐藏");
      log("提示: 3秒后恢复显示");
      setTimeout(async () => {
        await mainWindow?.setSkipTaskbar(false);
        log("✅ 窗口已恢复到任务栏");
      }, 3000);
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-win-blur")?.addEventListener("click", async () => {
  clear();
  log("=== win.blur() ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getCurrentWindow();
    }
    if (mainWindow) {
      await mainWindow.blur();
      log("✅ 窗口已失焦（最小化后恢复）");
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});
document.getElementById("btn-win-get-main")?.addEventListener("click", async () => {
  clear();
  log("=== browserWindow.getCurrentWindow() ===");
  try {
    const mainWindow = await browserWindow.getWindow(1);
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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
      mainWindow = await browserWindow.getCurrentWindow();
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

document.getElementById("btn-win-flash-taskbar")?.addEventListener("click", async () => {
  clear();
  log("=== win.flashTaskbar() [Windows] ===");
  try {
    if (!mainWindow) {
      mainWindow = await browserWindow.getCurrentWindow();
    }
    if (mainWindow) {
      await mainWindow.flashTaskbar(true);
      log("✅ 任务栏图标正在闪烁（5次）");
      log("提示: 窗口未激活时任务栏会橙色闪烁");
    } else {
      log("⚠️ 未找到主窗口");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});