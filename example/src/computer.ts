import { computer } from "vokex.app";
import { clear, log } from "./utils";

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
    const {displays} = await computer.getDisplays();
    log(`检测到 ${displays.length} 台显示器:`);
    displays.forEach((d, i) => {
      log(`  [${i}] ${d?.name?.trim()}: ${d.width}x${d.height} ${d.isPrimary ? '(主显示器)' : ''}`);
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