import { dialog, fs } from "vokex";
import { clear, log } from "./utils";

document.querySelector('#btn-dialog-msg')?.addEventListener('click', async () => {
    try {
        await dialog.showMessageBox({ title: '提示', message: '操作成功！', type: 'info' });
    } catch (error: any) {
        log(`❌ 错误: ${error.message}`);
    }
});

document.querySelector('#btn-dialog-open')?.addEventListener('click', async () => {
    clear();
    log("=== 打开文件 ===");
    try {
        const filePath = await dialog.showOpenDialog({
            title: '选择文件',
            filters: [{ name: '所有文件', extensions: ['*'] }]
        });
        log(filePath ? `选择: ${filePath}` : '已取消');
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