import { dialog, fs } from "vokex";
import { clear, log } from "./utils";

document.querySelector('#btn-dialog-msg')?.addEventListener('click', async () => {
    clear();
    log("=== 消息对话框 ===");
    try {
        const result = await dialog.showMessageBox({
            title: '确认操作',
            message: '确定要执行此操作吗？',
            type: 'okCancel',
            icon: 'warning'
        });
        log(`点击: ${result.response}, 取消: ${result.cancelled}`);
    } catch (error: any) {
        log(`❌ 错误: ${error.message}`);
    }
});

document.querySelector('#btn-dialog-error')?.addEventListener('click', async () => {
    try {
        await dialog.showErrorBox({ title: '错误', message: '操作失败，请重试。' });
    } catch (error: any) {
        log(`❌ 错误: ${error.message}`);
    }
});

document.querySelector('#btn-dialog-open')?.addEventListener('click', async () => {
    clear();
    log("=== 打开文件 ===");
    try {
        const result = await dialog.showOpenDialog({
            title: '选择文件',
            defaultPath: 'C:\\',
            filters: [{ name: '文本文件', extensions: ['txt', 'md'] }, { name: '所有文件', extensions: ['*'] }]
        });
        if (Array.isArray(result)) {
            result.forEach((p, i) => log(`[${i}] ${p}`));
        } else {
            log(result ? `选择: ${result}` : '已取消');
        }
    } catch (error: any) {
        log(`❌ 错误: ${error.message}`);
    }
});

document.querySelector('#btn-dialog-save')?.addEventListener('click', async () => {
    clear();
    log("=== 保存文件 ===");
    try {
        const filePath = await dialog.showSaveDialog({
            title: '保存文件',
            defaultPath: 'C:\\',
            defaultName: 'output.txt',
            filters: [{ name: '文本', extensions: ['txt'] }]
        });
        if (filePath) {
            await fs.writeFile(filePath, 'Hello from Vokex!');
            log(`✅ 文件已保存: ${filePath}`);
        } else {
            log('已取消');
        }
    } catch (error: any) {
        log(`❌ 错误: ${error.message}`);
    }
});

document.querySelector('#btn-dialog-dir')?.addEventListener('click', async () => {
    clear();
    log("=== 选择文件夹 ===");
    try {
        const result = await dialog.showOpenDialog({
            title: '选择文件夹',
            defaultPath: 'C:\\',
            directory: true,
        });
        log(result ? `选择: ${result}` : '已取消');
    } catch (error: any) {
        log(`❌ 错误: ${error.message}`);
    }
});