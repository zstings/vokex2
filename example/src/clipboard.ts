import { clipboard } from "vokex.app";
import { clear, log } from './utils';

document.querySelector('#btn-clipboard-copy')?.addEventListener('click', async () => {
    clear();
    log("=== 剪切板演示 ===");
    try {
        await clipboard.writeText('Hello from Vokex!');
        log("写入剪切板成功！");
    } catch (error) {
        log(`错误: ${error.message}`);
    }
})

document.querySelector('#btn-clipboard-read')?.addEventListener('click', async () => {
    clear();
    log("=== 剪切板演示 ===");
    try {
        const text = await clipboard.readText();
        log("读取成功！读取内容：" + text);
    } catch (error) {
        log(`错误: ${error.message}`);
    }
})

document.querySelector('#btn-clipboard-clear')?.addEventListener('click', async () => {
    clear();
    log("=== 剪切板演示 ===");
    try {
        await clipboard.clear();
        log("清空成功！");
    } catch (error) {
        log(`错误: ${error.message}`);
    }
})