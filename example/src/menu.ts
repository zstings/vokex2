import { computer, menu } from "vokex";
import { log, clear } from './utils';

// 监听菜单点击事件
menu.onMenuClick((data) => {
  log(`菜单点击: ${data.id}`);
});

document.getElementById("btn-set-menu")?.addEventListener("click", async () => {
  clear();
  log("=== 设置应用菜单栏 ===");

  try {
    await menu.setApplicationMenu([
      {
        type: 'submenu',
        label: '文件',
        submenu: [
          { id: 'new', label: '新建' },
          { id: 'open', label: '打开' },
          { type: 'separator' },
          { id: 'save', label: '保存', enabled: false },
          { type: 'separator' },
          { id: 'exit', label: '退出' },
        ],
      },
      {
        type: 'submenu',
        label: '视图',
        submenu: [
          { id: 'dark-mode', type: 'checkbox', label: '深色模式', checked: false },
          { id: 'fullscreen', type: 'checkbox', label: '全屏', checked: false },
        ],
      },
      {
        type: 'submenu',
        label: '帮助',
        submenu: [
          { id: 'about', label: '关于' },
        ],
      },
    ]);
    log("✅ 菜单栏设置成功");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

document.getElementById("btn-popup")?.addEventListener("click", async (e) => {
  clear();
  log("=== 弹出右键菜单 ===");
  try {
    await menu.setContextMenu(
      [
        { id: 'copy', label: '复制' },
        { id: 'paste', label: '粘贴' },
        { type: 'separator' },
        { id: 'select-all', label: '全选' },
      ],
      e.x,
      e.y,
    );
    console.log(e.screenX, e.x)
    log("✅ 右键菜单已弹出");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});