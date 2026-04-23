import { notification } from 'vokex';
import { log, clear } from './utils'

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