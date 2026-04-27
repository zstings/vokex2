use serde_json::json;
use std::fs::File;
use std::sync::Mutex;
use fs2::FileExt;

// 全局存储文件锁，防止被 drop 释放
static INSTANCE_LOCK: Mutex<Option<File>> = Mutex::new(None);

/// 处理 app 模块的 API 调用
pub fn handle(method: &str, params: &serde_json::Value) -> Result<serde_json::Value, String> {
    match method {
        "app.getAppPath" => get_app_path(),
        "app.getVersion" => get_version(),
        "app.getName" => get_name(),
        "app.getIdentifier" => get_identifier(),
        "app.getPid" => get_pid(),
        "app.getArgv" => get_argv(),
        "app.getEnv" => get_env(params),
        "app.getPlatform" => get_platform(),
        "app.getArch" => get_arch(),
        "app.getLocale" => get_locale(),
        "app.getPath" => get_path(params),
        "app.quit" => quit(),
        "app.exit" => exit(params),
        "app.restart" => restart(),
        "app.requestSingleInstanceLock" => request_single_instance_lock(),
        _ => Err(format!("Unknown app method: {}", method)),
    }
}

fn get_name() -> Result<serde_json::Value, String> {
    let config = crate::app_config::get_config();
    Ok(json!(config.name))
}

fn get_version() -> Result<serde_json::Value, String> {
    let config = crate::app_config::get_config();
    Ok(json!(config.version))
}

fn get_identifier() -> Result<serde_json::Value, String> {
    let config = crate::app_config::get_config();
    Ok(json!(config.identifier))
}

fn get_pid() -> Result<serde_json::Value, String> {
    Ok(json!(std::process::id()))
}

fn get_argv() -> Result<serde_json::Value, String> {
    let args: Vec<String> = std::env::args().collect();
    Ok(json!(args))
}

fn get_env(params: &serde_json::Value) -> Result<serde_json::Value, String> {
    // params: { key: "PATH" }
    let key = params.get("key")
        .and_then(|v| v.as_str())
        .ok_or("Missing param: key")?;
    let value = std::env::var(key).unwrap_or_default();
    Ok(json!(value))
}

fn get_platform() -> Result<serde_json::Value, String> {
    Ok(json!(std::env::consts::OS))
}

fn get_arch() -> Result<serde_json::Value, String> {
    Ok(json!(std::env::consts::ARCH))
}

fn get_locale() -> Result<serde_json::Value, String> {
    let locale = sys_locale::get_locale().unwrap_or_default();
    Ok(json!(locale))
}

fn get_app_path() -> Result<serde_json::Value, String> {
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {}", e))?;
    let dir = exe_path.parent()
        .ok_or("Failed to get exe directory")?;
    Ok(json!(dir.to_string_lossy().to_string()))
}

fn get_path(params: &serde_json::Value) -> Result<serde_json::Value, String> {
    let name = params.get("name")
        .and_then(|v| v.as_str())
        .ok_or("Missing param: name")?;
    
    let path = match name {
        "home" => dirs::home_dir(),
        "appData" => dirs::data_dir(),
        "desktop" => dirs::desktop_dir(),
        "documents" => dirs::document_dir(),
        "downloads" => dirs::download_dir(),
        "temp" => Some(std::env::temp_dir()),
        "cwd" => std::env::current_dir().ok(),
        _ => return Err(format!("Unknown path name: {}", name)),
    };
    
    match path {
        Some(p) => Ok(json!(p.to_string_lossy().to_string())),
        None => Err(format!("Could not find path for: {}", name)),
    }
}

fn quit() -> Result<serde_json::Value, String> {
    // 通过 proxy 发送退出事件，让主线程安全退出
    crate::ipc::send_quit_event();
    Ok(json!(null))
}

fn exit(params: &serde_json::Value) -> Result<serde_json::Value, String> {
    let code = params.get("code")
        .and_then(|v| v.as_i64())
        .unwrap_or(0) as i32;
    std::process::exit(code);
}

fn restart() -> Result<serde_json::Value, String> {
    let exe = std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {}", e))?;
    std::process::Command::new(exe)
        .spawn()
        .map_err(|e| format!("Failed to restart: {}", e))?;
    std::process::exit(0);
}

fn request_single_instance_lock() -> Result<serde_json::Value, String> {
    // 如果已经持有锁，直接返回 true
    {
        let guard = INSTANCE_LOCK.lock().unwrap();
        if guard.is_some() {
            return Ok(json!(true));
        }
    }

    let config = crate::app_config::get_config();
    let lock_path = std::env::temp_dir().join(format!("{}.lock", config.identifier));

    let file = File::create(&lock_path)
        .map_err(|e| format!("Failed to create lock file: {}", e))?;

    match file.try_lock_exclusive() {
        Ok(_) => {
            let mut guard = INSTANCE_LOCK.lock().unwrap();
            *guard = Some(file);
            Ok(json!(true))
        }
        Err(_) => {
            Ok(json!(false))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn ensure_config() {
        crate::app_config::init_test_config();
    }

    #[test]
    fn test_get_name() {
        ensure_config();
        let result = handle("app.getName", &json!({})).unwrap();
        assert_eq!(result, json!("Vokex Test"));
    }

    #[test]
    fn test_get_version() {
        ensure_config();
        let result = handle("app.getVersion", &json!({})).unwrap();
        assert_eq!(result, json!("0.1.0"));
    }

    #[test]
    fn test_get_identifier() {
        ensure_config();
        let result = handle("app.getIdentifier", &json!({})).unwrap();
        assert_eq!(result, json!("com.vokex.test"));
    }

    #[test]
    fn test_get_pid() {
        ensure_config();
        let result = handle("app.getPid", &json!({})).unwrap();
        assert!(result.as_u64().unwrap() > 0);
    }

    #[test]
    fn test_get_platform() {
        ensure_config();
        let result = handle("app.getPlatform", &json!({})).unwrap();
        let platform = result.as_str().unwrap();
        assert!(platform == "windows" || platform == "linux" || platform == "macos");
    }

    #[test]
    fn test_get_arch() {
        ensure_config();
        let result = handle("app.getArch", &json!({})).unwrap();
        let arch = result.as_str().unwrap();
        assert!(!arch.is_empty());
    }

    #[test]
    fn test_get_locale() {
        ensure_config();
        let result = handle("app.getLocale", &json!({})).unwrap();
        assert!(!result.as_str().unwrap().is_empty());
    }

    #[test]
    fn test_get_app_path() {
        ensure_config();
        let result = handle("app.getAppPath", &json!({})).unwrap();
        let path = result.as_str().unwrap();
        assert!(!path.is_empty());
    }

    #[test]
    fn test_get_path_home() {
        ensure_config();
        let result = handle("app.getPath", &json!({"name": "home"})).unwrap();
        assert!(!result.as_str().unwrap().is_empty());
    }

    #[test]
    fn test_get_path_temp() {
        ensure_config();
        let result = handle("app.getPath", &json!({"name": "temp"})).unwrap();
        assert!(!result.as_str().unwrap().is_empty());
    }

    #[test]
    fn test_get_path_cwd() {
        ensure_config();
        let result = handle("app.getPath", &json!({"name": "cwd"})).unwrap();
        assert!(!result.as_str().unwrap().is_empty());
    }

    #[test]
    fn test_get_path_invalid() {
        ensure_config();
        let result = handle("app.getPath", &json!({"name": "nonexistent"}));
        assert!(result.is_err());
    }

    #[test]
    fn test_get_argv() {
        ensure_config();
        let result = handle("app.getArgv", &json!({})).unwrap();
        assert!(result.as_array().unwrap().len() > 0);
    }

    #[test]
    fn test_get_env() {
        ensure_config();
        // PATH/HOME 在所有平台上都应存在
        let key = if cfg!(windows) { "PATH" } else { "HOME" };
        let result = handle("app.getEnv", &json!({"key": key})).unwrap();
        assert!(!result.as_str().unwrap().is_empty());
    }

    #[test]
    fn test_get_env_missing_key() {
        ensure_config();
        let result = handle("app.getEnv", &json!({}));
        assert!(result.is_err());
    }

    #[test]
    fn test_request_single_instance_lock() {
        ensure_config();
        let result = handle("app.requestSingleInstanceLock", &json!({})).unwrap();
        // 第一次调用应该成功获取锁
        assert!(result.as_bool().unwrap());
    }

    #[test]
    fn test_unknown_method() {
        ensure_config();
        assert!(handle("app.unknownMethod", &json!({})).is_err());
    }
}