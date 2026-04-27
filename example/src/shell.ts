import { shell, fs, app } from "vokex.app";

import { log, clear } from './utils'

document.getElementById("btn-shell-openexternal")?.addEventListener("click", async () => {
  clear();
  log("=== shell.openExternal 测试 ===");
  log("正在用默认浏览器打开 https://github.com...");
  try {
    await shell.openExternal("https://github.com");
    log("✅ 已请求打开链接");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-shell-openpath")?.addEventListener("click", async () => {
  clear();
  log("=== shell.openPath 测试 ===");
  try {
    const cwd = await app.getPath("cwd");
    log(`正在用文件管理器打开: ${cwd}`);
    await shell.openPath(cwd);
    log("✅ 已请求打开目录");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-shell-exec-dir")?.addEventListener("click", async () => {
  clear();
  log("=== shell.execCommand 测试: dir ===");
  try {
    const result = await shell.execCommand("dir");
    log(`退出码: ${result.code}`);
    log(`成功: ${result.success}`);
    log("\n输出内容:\n---");
    log(result.stdout);
    log("---");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-shell-exec-echo")?.addEventListener("click", async () => {
  clear();
  log("=== shell.execCommand 测试: echo ===");
  try {
    const message = "Hello from Vokex shell API!";
    const result = await shell.execCommand(`echo "${message}"`);
    log(`退出码: ${result.code}`);
    log(`成功: ${result.success}`);
    log(`输出: ${result.stdout.trim()}`);
    if (result.stderr) {
      log(`错误: ${result.stderr}`);
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-shell-trash")?.addEventListener("click", async () => {
  clear();
  log("=== shell.trashItem 测试 ===");
  
  const testFile = "trash_test.txt";
  
  try {
    log(`创建测试文件: ${testFile}`);
    await fs.writeFile(testFile, "这个文件会被移到回收站\nCreated by Vokex shell.trashItem demo");
    
    const exists = await fs.exists(testFile);
    log(`文件创建成功，存在: ${exists}`);
    
    log(`\n正在将文件移到回收站: ${testFile}`);
    await shell.trashItem(testFile);
    log("✅ 文件已移到回收站");
    
    const existsAfter = await fs.exists(testFile);
    log(`移动后文件存在: ${existsAfter}`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});