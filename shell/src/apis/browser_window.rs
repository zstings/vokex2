use serde_json::{json, Value};

/// browserWindow 模块 API 处理
/// 注意：browserWindow.create 在 ipc.rs 中被拦截，直接走 CreateWindow 事件
/// 这里只处理其他窗口操作 API
pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        // 预留：其他窗口操作 API
        "browserWindow.getAll" => {
            let ids = crate::window_manager::get_all_ids();
            Ok(json!(ids))
        }
        _ => Err(format!("Unknown method: {}", method)),
    }
}