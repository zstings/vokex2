// import { app } from "vokex.app";

// import { log, clear } from './utils'

// // ==================== Computer API 测试 ====================


// log("页面已加载");

// // ==================== Tray API 测试 ====================

// let currentTray:  null = null;

// document.getElementById("btn-tray-create")?.addEventListener("click", async () => {
//   clear();
//   log("=== tray.create() ===");
//   try {
//     // 获取应用路径来定位图标
//     const appPath = await app.getAppPath();
//     log(`应用路径: ${appPath}`);
//     log("正在创建系统托盘图标...");

//     // 尝试使用应用目录下的 icon.png，如果不存在则使用空路径（会报错）
//     const iconPath = `${appPath}\\icon.png`;
//     log(`图标路径: ${iconPath}`);

//     currentTray = await tray.create({
//       icon: iconPath,
//       tooltip: "Vokex Demo - 系统托盘",
//       menu: [
//         { type: "normal", id: "tray-show", label: "显示窗口" },
//         { type: "separator" },
//         { type: "normal", id: "tray-about", label: "关于" },
//         { type: "separator" },
//         { type: "normal", id: "tray-quit", label: "退出" },
//       ],
//     });

//     log(`✅ 托盘已创建，ID: ${currentTray.getId()}`);
//     log("  提示: 查看系统托盘区域，应该能看到图标");
//     log("  提示: 右键托盘图标可看到菜单");
//   } catch (error: any) {
//     log(`❌ 错误: ${error.message}`);
//     log("  提示: 请确保 icon.png 文件存在于应用目录中");
//     log("  提示: 可以用任意 32x32 PNG 图标测试");
//   }
// });

// document.getElementById("btn-tray-set-tooltip")?.addEventListener("click", async () => {
//   clear();
//   log("=== tray.setToolTip() ===");
//   try {
//     if (!currentTray) {
//       log("⚠️ 请先创建托盘");
//       return;
//     }
//     const tooltip = `Vokex Demo - ${new Date().toLocaleTimeString()}`;
//     await currentTray.setToolTip(tooltip);
//     log(`✅ 提示文本已设置为: ${tooltip}`);
//   } catch (error: any) {
//     log(`❌ 错误: ${error.message}`);
//   }
// });

// document.getElementById("btn-tray-set-menu")?.addEventListener("click", async () => {
//   clear();
//   log("=== tray.setMenu() ===");
//   try {
//     if (!currentTray) {
//       log("⚠️ 请先创建托盘");
//       return;
//     }
//     await currentTray.setMenu([
//       { type: "normal", id: "tray-show", label: "显示窗口" },
//       { type: "checkbox", id: "tray-auto-start", label: "开机自启", checked: true },
//       { type: "separator" },
//       { type: "normal", id: "tray-settings", label: "设置..." },
//       { type: "separator" },
//       { type: "normal", id: "tray-quit", label: "退出" },
//     ]);
//     log("✅ 托盘菜单已更新");
//     log("  新增: 开机自启(复选框)、设置");
//   } catch (error: any) {
//     log(`❌ 错误: ${error.message}`);
//   }
// });

// document.getElementById("btn-tray-destroy")?.addEventListener("click", async () => {
//   clear();
//   log("=== tray.destroy() ===");
//   try {
//     if (!currentTray) {
//       log("⚠️ 托盘不存在");
//       return;
//     }
//     await currentTray.destroy();
//     log("✅ 托盘已销毁");
//     currentTray = null;
//   } catch (error: any) {
//     log(`❌ 错误: ${error.message}`);
//   }
// });

// document.getElementById("btn-tray-listen")?.addEventListener("click", async () => {
//   clear();
//   log("=== 监听托盘事件 ===");
//   try {
//     tray.on("click", ({ trayId }) => {
//       log(`📢 托盘左键点击: trayId = ${trayId}`);
//     });
//     tray.on("right-click", ({ trayId }) => {
//       log(`📢 托盘右键点击: trayId = ${trayId}`);
//     });
//     tray.on("double-click", ({ trayId }) => {
//       log(`📢 托盘双击: trayId = ${trayId}`);
//     });

//     // 同时监听托盘菜单点击
//     // menu.on("clicked", ({ menuId }) => {
//     //   if (menuId.startsWith("tray-")) {
//     //     log(`📢 托盘菜单点击: ${menuId}`);
//     //     switch (menuId) {
//     //       case "tray-show":
//     //         log("  → 显示窗口");
//     //         break;
//     //       case "tray-quit":
//     //         log("  → 退出应用");
//     //         break;
//     //       case "tray-settings":
//     //         log("  → 打开设置");
//     //         break;
//     //     }
//     //   }
//     // });

//     log("✅ 托盘事件监听已注册");
//     log("  监听: click / right-click / double-click");
//     log("  提示: 点击托盘图标，事件会显示在此处");
//   } catch (error: any) {
//     log(`❌ 错误: ${error.message}`);
//   }
// });
