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