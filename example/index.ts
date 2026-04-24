import { app, notification, fs, process, shell, computer, http, storage, browserWindow, BrowserWindow, menu, tray, Tray } from "vokex";

const output = document.getElementById("output") as HTMLDivElement;

function log(message: string): void {
  output.textContent += message + "\n";
  output.scrollTop = output.scrollHeight;
  console.log(output.textContent);
}

function clear(): void {
  output.textContent = "";
}

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

document.getElementById("btn-events")?.addEventListener("click", async () => {
  clear();
  log("=== 事件监听测试 ===");
  log("已注册事件监听器:");
  log("- app.ready: 应用初始化完成");
  log("- app.before-quit: 应用即将退出");
  log("");
  log("提示: 关闭窗口时会触发 before-quit 事件");
});

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

document.getElementById("btn-fs-demo")?.addEventListener("click", async () => {
  clear();
  log("=== 文件系统完整演示 ===");

  try {
    const appPath = await app.getAppPath();
    const testDir = `${appPath}\\test_demo`;
    const testFile = `${testDir}\\test.txt`;
    const copyFile = `${testDir}\\test_copy.txt`;
    log(`1. 检查目录是否存在: ${testDir}`);
    const dirExists = await fs.exists(testDir);
    if (!dirExists) {
      log(`2. 创建目录: ${testDir}`);
      await fs.createDir(testDir);
    } else {
      log(`2. 目录已存在: ${testDir}`);
    }

    log(`3. 写入文件: ${testFile}`);
    const content = `这是一个测试文件\n创建时间: ${new Date().toString()}\n来自 Vokex fs API`;
    await fs.writeFile(testFile, content);

    log(`4. 读取文件内容:`);
    const readContent = await fs.readFile(testFile);
    log(`---\n${readContent}\n---`);

    log(`5. 复制文件到: ${copyFile}`);
    await fs.copyFile(testFile, copyFile);

    log(`6. 读取目录内容: ${testDir}`);
    const entries = await fs.readDir(testDir);
    log(`目录包含 ${entries.length} 个条目:`);
    entries.forEach(entry => {
      log(`  ${entry.isDir ? "📁" : "📄"} ${entry.name}`);
    });

    log(`7. 获取文件信息: ${testFile}`);
    const stat = await fs.stat(testFile);
    log(`  是否文件: ${stat.isFile}`);
    log(`  是否目录: ${stat.isDir}`);
    log(`  文件大小: ${stat.size} 字节`);

    log("\n✅ 演示完成！所有操作成功");
    log(`   测试文件位置: ${testFile}`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-fs-read")?.addEventListener("click", async () => {
  clear();
  log("=== 读取文件测试 ===");
  log("尝试读取 test.txt...");

  try {
    const content = await fs.readFile("test_demo/test.txt");
    log(`文件内容 (前 300 字符):\n---\n${content.slice(0, 300)}...\n---`);
    log(`文件总长度: ${content.length} 字符`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
    log("提示: 请确保在正确的工作目录运行");
  }
});

document.getElementById("btn-fs-write")?.addEventListener("click", async () => {
  clear();
  log("=== 写入文件测试 ===");

  const fileName = `test_demo/test_${Date.now()}.txt`;
  const content = `Hello from Vokex!\nTimestamp: ${Date.now()}\n这是通过 fs.writeFile 写入的文件。`;

  try {
    await fs.writeFile(fileName, content);
    log(`✅ 文件已写入: ${fileName}`);
    log(`文件内容:\n---\n${content}\n---`);

    const exists = await fs.exists(fileName);
    log(`文件存在: ${exists}`);

    const stat = await fs.stat(fileName);
    log(`文件大小: ${stat.size} 字节`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-fs-readdir")?.addEventListener("click", async () => {
  clear();
  log("=== 读取目录测试 ===");
  log("当前目录内容:");

  try {
    const entries = await fs.readDir(".");
    entries.forEach(entry => {
      const icon = entry.isDir ? "📁" : "📄";
      log(`  ${icon} ${entry.name}`);
    });
    log(`\n总共 ${entries.length} 个条目`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-fs-stat")?.addEventListener("click", async () => {
  clear();
  log("=== 文件信息测试 ===");

  try {
    const stat = await fs.stat("test_demo/test.txt");
    log(`test_demo/test.txt:`);
    log(`  isFile: ${stat.isFile}`);
    log(`  isDir: ${stat.isDir}`);
    log(`  size: ${stat.size} bytes`);
    log(`  modified: ${stat.modified} seconds ago`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-fs-copy")?.addEventListener("click", async () => {
  clear();
  log("=== 复制文件测试 ===");

  const src = "test_demo/test.txt";
  const dest = "test_demo/test.txt.copy";

  try {
    await fs.copyFile(src, dest);
    log(`✅ 已复制 ${src} -> ${dest}`);
    const exists = await fs.exists(dest);
    log(`目标文件存在: ${exists}`);
    const stat = await fs.stat(dest);
    log(`目标文件大小: ${stat.size} bytes`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-fs-delete")?.addEventListener("click", async () => {
  clear();
  log("=== 删除文件测试 ===");

  const fileName = "test_demo/test.txt";

  try {
    const existsBefore = await fs.exists(fileName);
    log(`删除前文件存在: ${existsBefore}`);

    if (existsBefore) {
      await fs.deleteFile(fileName);
      log(`✅ 已删除文件: ${fileName}`);

      const existsAfter = await fs.exists(fileName);
      log(`删除后文件存在: ${existsAfter}`);
    } else {
      log(`⚠️ 文件不存在: ${fileName}`);
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-fs-rmdir")?.addEventListener("click", async () => {
  clear();
  log("=== 删除目录测试 ===");

  const dirName = "test_demo";

  try {
    const existsBefore = await fs.exists(dirName);
    log(`删除前目录存在: ${existsBefore}`);

    if (existsBefore) {
      await fs.removeDir(dirName);
      log(`✅ 已删除目录: ${dirName} (递归删除所有内容)`);

      const existsAfter = await fs.exists(dirName);
      log(`删除后目录存在: ${existsAfter}`);
    } else {
      log(`⚠️ 目录不存在: ${dirName}`);
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-fs-read-binary")?.addEventListener("click", async () => {
  clear();
  log("=== 读取二进制文件测试 ===");
  log("尝试读取 test.txt...");

  try {
    const data = await fs.readFileBinary("test_demo/test.txt");
    log(`读取成功，字节长度: ${data.length}`);
    log(`前 10 字节: [${Array.from(data.slice(0, 10)).join(', ')}]`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
    log("提示: 请确保在正确的工作目录运行");
  }
});

document.getElementById("btn-fs-append")?.addEventListener("click", async () => {
  clear();
  log("=== 追加内容测试 ===");

  const fileName = "test_demo/test.txt";
  const appendContent = `\n[追加] 这是追加的一行\n时间戳: ${Date.now()}\n`;

  try {
    const exists = await fs.exists(fileName);
    if (!exists) {
      log(`⚠️ 文件不存在，先创建文件: ${fileName}`);
      await fs.writeFile(fileName, "初始内容\n");
    }

    const statBefore = await fs.stat(fileName);
    log(`追加前大小: ${statBefore.size} 字节`);

    await fs.appendFile(fileName, appendContent);
    log(`✅ 已追加内容到: ${fileName}`);

    const statAfter = await fs.stat(fileName);
    log(`追加后大小: ${statAfter.size} 字节`);
    log(`增加了 ${statAfter.size - statBefore.size} 字节`);

    const fullContent = await fs.readFile(fileName);
    log(`\n完整内容:\n---\n${fullContent}\n---`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-fs-move")?.addEventListener("click", async () => {
  clear();
  log("=== 移动/重命名文件测试 ===");

  const src = "test_demo/test.txt";
  const dest = "test_demo/test_renamed.txt";

  try {
    const srcExists = await fs.exists(src);
    if (!srcExists) {
      log(`⚠️ 源文件不存在: ${src}`);
      log("先创建源文件...");
      await fs.createDir("test_demo");
      await fs.writeFile(src, "这是要被重命名的文件\n");
    }

    const destExistsBefore = await fs.exists(dest);
    log(`目标文件已存在: ${destExistsBefore}`);

    await fs.moveFile(src, dest);
    log(`✅ 已移动/重命名: ${src} -> ${dest}`);

    const srcExistsAfter = await fs.exists(src);
    const destExistsAfter = await fs.exists(dest);
    log(`源文件现在存在: ${srcExistsAfter}`);
    log(`目标文件现在存在: ${destExistsAfter}`);

    if (destExistsAfter) {
      const content = await fs.readFile(dest);
      log(`\n目标文件内容:\n---\n${content}\n---`);
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-process-info")?.addEventListener("click", async () => {
  clear();
  log("=== 进程基本信息 ===");

  try {
    const pid = await process.getPid();
    const argv = await process.getArgv();
    const platform = await process.getPlatform();
    const arch = await process.getArch();
    const hostname = await process.hostname();
    const cwd = await process.cwd();
    const homeDir = await process.homeDir();
    const tempDir = await process.tempDir();

    log(`PID: ${pid}`);
    log(`Platform: ${platform}`);
    log(`Arch: ${arch}`);
    log(`Hostname: ${hostname}`);
    log(`CWD: ${cwd}`);
    log(`Home Dir: ${homeDir}`);
    log(`Temp Dir: ${tempDir}`);
    log(`\nArgv (${argv.length}):`);
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
    log(`User CPU: ${cpu.user.toFixed(2)} 秒`);
    log(`System CPU: ${cpu.system.toFixed(2)} 秒`);
    log(`Total CPU: ${(cpu.user + cpu.system).toFixed(2)} 秒`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-process-memory")?.addEventListener("click", async () => {
  clear();
  log("=== 内存信息 ===");

  try {
    const mem = await process.getMemoryInfo();
    const rssKB = (mem.rss / 1024).toFixed(0);
    const rssMB = (mem.rss / 1024 / 1024).toFixed(2);
    log(`RSS (常驻内存大小): ${mem.rss} bytes = ${rssKB} KB = ${rssMB} MB`);
    if (mem.heapTotal > 0) {
      const heapTotalMB = (mem.heapTotal / 1024 / 1024).toFixed(2);
      log(`Heap Total: ${heapTotalMB} MB`);
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

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
    const cwd = await process.cwd();
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

// ==================== HTTP API 测试 ====================

document.getElementById("btn-http-get")?.addEventListener("click", async () => {
  clear();
  log("=== http.get() ===");
  log("请求: https://jsonplaceholder.typicode.com/todos/1");
  try {
    const response = await http.get("https://jsonplaceholder.typicode.com/todos/1");
    log(`状态码: ${response.statusCode}`);
    log(`成功: ${response.ok}`);
    log(`\n响应体:`);
    log(response.body);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-http-post")?.addEventListener("click", async () => {
  clear();
  log("=== http.post() ===");
  log("POST: https://jsonplaceholder.typicode.com/posts");
  log(`数据: ${JSON.stringify({ title: 'foo', body: 'bar', userId: 1 }, null, 2)}`);
  try {
    const data = { title: 'foo', body: 'bar', userId: 1 };
    const response = await http.post("https://jsonplaceholder.typicode.com/posts", data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    log(`\n状态码: ${response.statusCode}`);
    log(`成功: ${response.ok}`);
    log(`\n响应体:`);
    log(response.body);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

// ==================== Storage API 测试 ====================

document.getElementById("btn-storage-set")?.addEventListener("click", async () => {
  clear();
  log("=== storage.setData() ===");
  try {
    const testData = {
      name: "Vokex",
      version: "0.1.0",
      features: ["desktop", "rust", "typescript"],
      timestamp: Date.now(),
    };
    await storage.setData("test_key", testData);
    log("✅ 已存储数据:");
    log(`  key: test_key`);
    log(`  value: ${JSON.stringify(testData, null, 2)}`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-storage-get")?.addEventListener("click", async () => {
  clear();
  log("=== storage.getData() ===");
  try {
    const data = await storage.getData("test_key");
    if (data === null) {
      log("⚠️ 键 test_key 不存在，请先点击「设置存储」");
    } else {
      log("✅ 读取到数据:");
      log(JSON.stringify(data, null, 2));
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-storage-keys")?.addEventListener("click", async () => {
  clear();
  log("=== storage.getKeys() ===");
  try {
    const keys = await storage.getKeys();
    log(`存储中共有 ${keys.length} 个键:`);
    keys.forEach((key, i) => log(`  [${i}] ${key}`));
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-storage-has")?.addEventListener("click", async () => {
  clear();
  log("=== storage.has() ===");
  try {
    const exists = await storage.has("test_key");
    log(`键 "test_key" 是否存在: ${exists}`);
    if (!exists) {
      log("提示: 请先点击「设置存储」");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-storage-remove")?.addEventListener("click", async () => {
  clear();
  log("=== storage.removeData() ===");
  try {
    const existsBefore = await storage.has("test_key");
    log(`删除前 "test_key" 是否存在: ${existsBefore}`);
    if (existsBefore) {
      await storage.removeData("test_key");
      const existsAfter = await storage.has("test_key");
      log(`✅ 已删除 "test_key"`);
      log(`删除后 "test_key" 是否存在: ${existsAfter}`);
    } else {
      log("⚠️ 键不存在，无需删除");
    }
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-storage-clear")?.addEventListener("click", async () => {
  clear();
  log("=== storage.clear() ===");
  try {
    const keysBefore = await storage.getKeys();
    log(`清空前共有 ${keysBefore.length} 个键`);
    await storage.clear();
    const keysAfter = await storage.getKeys();
    log(`✅ 已清空所有存储`);
    log(`清空后共有 ${keysAfter.length} 个键`);
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

log("页面已加载");
log(
  "可用 API: app.quit(), app.exit(code), app.restart(), app.getAppPath(), app.getPath(name), app.getVersion(), app.getName(), app.setName(name), app.getLocale(), app.setDockBadge(text), app.requestSingleInstanceLock(), app.setProxy(config), app.on(event, callback), notification.show(options), notification.isSupported()",
);
log(
  "fs API: fs.readFile, fs.readFileBinary, fs.writeFile, fs.appendFile, fs.deleteFile, fs.readDir, fs.createDir, fs.removeDir, fs.stat, fs.exists, fs.copyFile, fs.moveFile",
);
log(
  "process API: process.getPid, process.getArgv, process.getEnv, process.getPlatform, process.getArch, process.getUptime, process.getCpuUsage, process.getMemoryInfo, process.homeDir, process.tempDir, process.hostname, process.cwd, process.exit, process.kill",
);
log(
  "shell API: shell.openExternal, shell.openPath, shell.execCommand, shell.trashItem",
);
log(
  "computer API: computer.getCpuInfo, computer.getMemoryInfo, computer.getOsInfo, computer.getDisplays, computer.getMousePosition, computer.getKeyboardLayout",
);
log(
  "http API: http.get, http.post, http.put, http.delete, http.request",
);
log(
  "storage API: storage.setData, storage.getData, storage.getKeys, storage.has, storage.removeData, storage.clear",
);
log(
  "browserWindow API: browserWindow.create, browserWindow.getAll, browserWindow.getFocused, browserWindow.getById, browserWindow.getMainWindow, win.close, win.show, win.hide, win.minimize, win.maximize, win.unmaximize, win.restore, win.focus, win.blur, win.isMaximized, win.isMinimized, win.isFullScreen, win.setFullScreen, win.setTitle, win.getTitle, win.setSize, win.getSize, win.setMinimumSize, win.setMaximumSize, win.setResizable, win.setAlwaysOnTop, win.setPosition, win.getPosition, win.center, win.setOpacity, win.setBackgroundColor, win.setIcon, win.loadFile, win.loadURL, win.reload, win.setProgressBar, win.setSkipTaskbar, win.capturePage, win.on",
);
log(
  "menu API: menu.setApplicationMenu, menu.setContextMenu, menu.removeContextMenu, menu.sendAction, menu.on",
);
log(
  "tray API: tray.create, tray.setToolTip, tray.setTitle, tray.setMenu, tray.setImage, tray.destroy, tray.displayBalloon, tray.on",
);

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
