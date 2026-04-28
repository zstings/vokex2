import { computer, menu } from "vokex.app";
import { log, clear } from './utils';

// 监听菜单点击事件
menu.onMenuClick((data) => {
  log(`菜单点击: ${data.id}`);
});

// ==================== 设置应用菜单栏 ====================

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
          { type: 'native', nativeLabel: 'quit' },
        ],
      },
      {
        type: 'submenu',
        label: '编辑',
        submenu: [
          { type: 'native', nativeLabel: 'undo' },
          { type: 'native', nativeLabel: 'redo' },
          { type: 'separator' },
          { type: 'native', nativeLabel: 'cut' },
          { type: 'native', nativeLabel: 'copy' },
          { type: 'native', nativeLabel: 'paste' },
          { type: 'native', nativeLabel: 'selectAll' },
        ],
      },
      {
        type: 'submenu',
        label: '视图',
        submenu: [
          { id: 'dark-mode', type: 'checkbox', label: '深色模式', checked: false },
          { id: 'auto-refresh', type: 'checkbox', label: '自动刷新', checked: true },
          { type: 'separator' },
          { type: 'native', nativeLabel: 'fullscreen' },
        ],
      },
      {
        type: 'submenu',
        label: '窗口',
        submenu: [
          { type: 'native', nativeLabel: 'minimize' },
          { type: 'native', nativeLabel: 'maximize' },
          { type: 'separator' },
          { type: 'native', nativeLabel: 'closeWindow' },
        ],
      },
      {
        type: 'submenu',
        label: '帮助',
        submenu: [
          { type: 'native', nativeLabel: 'about' },
          { id: 'docs', label: '文档' },
          { id: 'report', label: '反馈问题' },
        ],
      },
    ]);
    log("✅ 菜单栏设置成功");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

// ==================== 移除应用菜单栏 ====================

document.getElementById("btn-remove-menu")?.addEventListener("click", async () => {
  clear();
  log("=== 移除应用菜单栏 ===");
  try {
    await menu.removeApplicationMenu();
    log("✅ 菜单栏已移除");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});

// ==================== 弹出右键菜单 ====================

document.getElementById("btn-popup")?.addEventListener("click", async (e) => {
  clear();
  log("=== 弹出右键菜单 ===");
  try {
    await menu.setContextMenu(
      [
        { id: 'copy', label: '复制' },
        { id: 'paste', label: '粘贴' },
        { id: 'cut', label: '剪切' },
        { type: 'separator' },
        { id: 'select-all', label: '全选' },
        { type: 'separator' },
        {
          type: 'submenu',
          label: '更多',
          submenu: [
            { id: 'inspect', label: '检查元素' },
            { id: 'reload', label: '刷新页面' },
          ],
        },
      ],
      e.x,
      e.y,
    );
    log("✅ 右键菜单已弹出");
  } catch (error: any) {
    log(`❌ 错误: ${error.message}`);
  }
});
