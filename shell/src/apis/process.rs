use serde_json::{json, Value};

pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "process.getUptime" => {
            let uptime = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs();
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
            let pid = params.get("pid").and_then(|v| v.as_i64())
                .ok_or("Missing 'pid' parameter")?;
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
            let env: serde_json::Map<String, Value> = std::env::vars()
                .map(|(k, v)| (k, json!(v)))
                .collect();
            Ok(json!(env))
        }

        _ => Err(format!("Unknown method: {}", method)),
    }
}