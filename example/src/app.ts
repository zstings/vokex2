import { app } from "vokex";

import { log, clear } from './utils'

app.on("ready", () => {
  log("📢 事件: app.ready - 应用已就绪");
});

app.on("before-quit", () => {
  log("📢 事件: app.before-quit - 应用即将退出");
});

document.getElementById("btn-app-info")?.addEventListener("click", async () => {
  clear();
  log("=== 应用信息 ===");
  try {
    const name = await app.getName();
    const version = await app.getVersion();
    console.log(name, version);
    log(`应用名称: ${name}`);
    log(`应用版本: ${version}`);
  } catch (error: any) {
    log(`错误: ${error.message}`);
  }
});

document.getElementById("btn-app-paths")?.addEventListener("click", async () => {
  clear();
  log("=== 应用路径 ===");
  try {
    const appPath = await app.getAppPath();
    log(`应用路径: ${appPath}`);
  } catch (error: any) {
    log(`错误: ${error.message}`);
  }
});

document
  .getElementById("btn-system-paths")
  ?.addEventListener("click", async () => {
    clear();
    log("=== 系统路径 ===");
    try {
      const paths = [
        "home",
        "appData",
        "desktop",
        "documents",
        "downloads",
        "temp",
        "cwd"
      ] as const;
      for (const name of paths) {
        const path = await app.getPath(name);
        log(`${name}: ${path}`);
      }
    } catch (error: any) {
      log(`错误: ${error.message}`);
    }
  });


document.getElementById("btn-locale")?.addEventListener("click", async () => {
  clear();
  log("=== 系统语言 ===");
  try {
    const locale = await app.getLocale();
    log(`系统语言: ${locale}`);
  } catch (error: any) {
    log(`错误: ${error.message}`);
  }
});

document.getElementById("btn-single-instance")?.addEventListener("click", async () => {
  clear();
  log("=== 单实例锁测试 ===");
  log("尝试请求单实例锁...");
  try {
    const isFirstInstance = await app.requestSingleInstanceLock();
    if (isFirstInstance) {
      log("✅ 成功获取单实例锁！");
      log("   当前是首个实例，可以正常运行。");
      log("   提示：尝试再次启动应用，新实例会返回 false");
    } else {
      log("❌ 获取单实例锁失败！");
      log("   已有实例在运行，当前实例应该退出。");
    }
  } catch (error: any) {
    log(`错误: ${error.message}`);
  }
});

document.getElementById("btn-restart")?.addEventListener("click", async () => {
  clear();
  log("正在重启应用...");
  try {
    await app.restart();
  } catch (error: any) {
    log(`错误: ${error.message}`);
  }
});

document.getElementById("btn-quit")?.addEventListener("click", async () => {
  clear();
  log("正在退出应用...");
  try {
    await app.quit();
  } catch (error: any) {
    log(`错误: ${error.message}`);
  }
});