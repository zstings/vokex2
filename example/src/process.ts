import { app, process } from "vokex";

import { log, clear } from './utils'
document.getElementById("btn-process-info")?.addEventListener("click", async () => {
  clear();
  log("=== 进程基本信息 ===");

  try {
    const argv = await app.getArgv();
    
    const hostname = await process.hostname();

    log(`Hostname: ${hostname}`);
    argv.forEach((arg, i) => log(`  [${i}] ${arg}`));
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-process-uptime")?.addEventListener("click", async () => {
  clear();
  log("=== 进程运行时长 ===");

  try {
    const uptime = await process.getUptime();
    log(`进程已运行: ${uptime} 秒`);
    log(`约 ${(uptime / 60).toFixed(2)} 分钟`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-process-cpu")?.addEventListener("click", async () => {
  clear();
  log("=== CPU 使用率 ===");

  try {
    const cpu = await process.getCpuUsage();
    log(`User CPU: ${cpu.user.toFixed(2)} %`);
    log(`System CPU: ${cpu.system.toFixed(2)} %`);
    log(`Total CPU: ${(cpu.user + cpu.system).toFixed(2)} %`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-process-memory")?.addEventListener("click", async () => {
  clear();
  log("=== 内存信息 ===");

  try {
    const mem = await process.getMemoryInfo();
    const totalGB = (mem.total / 1024 / 1024 / 1024).toFixed(2);
    const usedGB = (mem.used / 1024 / 1024 / 1024).toFixed(2);
    const availableGB = (mem.available / 1024 / 1024 / 1024).toFixed(2);
    log(`总内存: ${totalGB} GB`);
    log(`已用: ${usedGB} GB`);
    log(`可用: ${availableGB} GB`);
    } catch (error: any) {
        log(`❌ 错误: ${error.message}`);
    }
});