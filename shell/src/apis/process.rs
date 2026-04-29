use serde_json::{json, Value};

pub fn handle(method: &str, params: &Value, _window_id: u32) -> Result<Value, String> {
    match method {
       "process.getUptime" => {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs();
            let uptime = now - crate::START_TIME.load(std::sync::atomic::Ordering::Relaxed);
            Ok(json!(uptime))
        }

        "process.getCpuUsage" => {
            let mut sys = sysinfo::System::new();
            sys.refresh_cpu_usage();
            std::thread::sleep(std::time::Duration::from_millis(500));
            sys.refresh_cpu_usage();
            let usage = sys.global_cpu_usage();
            Ok(json!({
                "user": usage as f64,
                "system": 0.0
            }))
        }

        "process.getMemoryInfo" => {
            let mut sys = sysinfo::System::new();
            sys.refresh_memory();
            Ok(json!({
                "total": sys.total_memory(),
                "available": sys.available_memory(),
                "used": sys.used_memory()
            }))
        }

        "process.hostname" => {
            let hostname = hostname::get()
                .map(|h| h.to_string_lossy().to_string())
                .unwrap_or_default();
            Ok(json!(hostname))
        }

        "process.kill" => {
            let perms = crate::apis::permissions::get_permissions(_window_id);
            if !perms.process.allow_kill {
                return Err("Permission denied: process.kill is not allowed for this window".to_string());
            }

            let pid = params.get("pid").and_then(|v| v.as_i64())
                .ok_or("Missing 'pid' parameter")?;

            // 安全检查：不允许杀自己的进程
            let current_pid = std::process::id() as i64;
            if pid == current_pid {
                return Err("Cannot kill own process".to_string());
            }

            #[cfg(target_os = "windows")]
            {
                std::process::Command::new("taskkill")
                    .args(["/F", "/PID", &pid.to_string()])
                    .spawn()
                    .map_err(|e| format!("Failed to kill process: {}", e))?;
            }
            #[cfg(not(target_os = "windows"))]
            {
                std::process::Command::new("kill")
                    .arg("-9")
                    .arg(pid.to_string())
                    .spawn()
                    .map_err(|e| format!("Failed to kill process: {}", e))?;
            }
            Ok(json!(true))
        }

        "process.env" => {
            let perms = crate::apis::permissions::get_permissions(_window_id);
            let allowed_keys = &perms.process.env_keys;

            if allowed_keys.is_empty() {
                // 空白名单 = 不限制（主窗口默认）
                let env: serde_json::Map<String, Value> = std::env::vars()
                    .map(|(k, v)| (k, json!(v)))
                    .collect();
                Ok(json!(env))
            } else {
                // 只返回白名单中的 key
                let mut env = serde_json::Map::new();
                for key in allowed_keys {
                    if let Ok(val) = std::env::var(key) {
                        env.insert(key.clone(), json!(val));
                    }
                }
                Ok(json!(env))
            }
        }

        _ => Err(format!("Unknown method: {}", method)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_get_uptime() {
        let result = handle("process.getUptime", &json!({})).unwrap();
        // 测试环境下 START_TIME 为 0，uptime 是当前时间戳
        assert!(result.as_u64().unwrap() > 0);
    }

    #[test]
    fn test_get_cpu_usage() {
        let result = handle("process.getCpuUsage", &json!({})).unwrap();
        assert!(result["user"].as_f64().is_some());
    }

    #[test]
    fn test_get_memory_info() {
        let result = handle("process.getMemoryInfo", &json!({})).unwrap();
        assert!(result["total"].as_u64().unwrap() > 0);
        assert!(result["used"].as_u64().unwrap() > 0);
    }

    #[test]
    fn test_hostname() {
        let result = handle("process.hostname", &json!({})).unwrap();
        assert!(!result.as_str().unwrap().is_empty());
    }

    #[test]
    fn test_env() {
        let result = handle("process.env", &json!({})).unwrap();
        let env = result.as_object().unwrap();
        assert!(!env.is_empty());
        // 检查常见的环境变量（Windows 上 key 可能是 Path 而非 PATH）
        let has_common = env.keys().any(|k| {
            k.eq_ignore_ascii_case("PATH")
                || k.eq_ignore_ascii_case("HOME")
                || k.eq_ignore_ascii_case("USERPROFILE")
                || k.eq_ignore_ascii_case("SYSTEMROOT")
        });
        assert!(has_common, "env should contain PATH/HOME/USERPROFILE/SYSTEMROOT, got keys: {:?}", env.keys().collect::<Vec<_>>());
    }

    #[test]
    fn test_unknown_method() {
        assert!(handle("process.unknownMethod", &json!({})).is_err());
    }
}