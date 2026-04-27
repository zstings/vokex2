use serde_json::{json, Value};
use std::process::Command;

/// 用系统默认程序打开 URL
fn open_external(url: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", url])
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    Ok(())
}

/// 用系统默认程序打开文件/目录
fn open_path(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", path])
            .spawn()
            .map_err(|e| format!("Failed to open path: {}", e))?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open path: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open path: {}", e))?;
    }
    Ok(())
}

/// 执行系统命令
fn exec_command(command: &str, cwd: Option<&str>, env: Option<&Value>) -> Result<Value, String> {
    #[cfg(target_os = "windows")]
    let mut cmd = Command::new("cmd");
    #[cfg(not(target_os = "windows"))]
    let mut cmd = Command::new("/bin/sh");
    
    #[cfg(target_os = "windows")]
    cmd.args(["/C", command]);
    #[cfg(not(target_os = "windows"))]
    cmd.args(["-c", command]);

    if let Some(dir) = cwd {
        cmd.current_dir(dir);
    }

    if let Some(env_vars) = env {
        if let Some(obj) = env_vars.as_object() {
            for (key, val) in obj {
                if let Some(s) = val.as_str() {
                    cmd.env(key, s);
                }
            }
        }
    }

    let output = cmd.output().map_err(|e| format!("Failed to execute command: {}", e))?;

    Ok(json!({
        "code": output.status.code().unwrap_or(-1),
        "stdout": String::from_utf8_lossy(&output.stdout).to_string(),
        "stderr": String::from_utf8_lossy(&output.stderr).to_string(),
        "success": output.status.success()
    }))
}

pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "shell.openExternal" => {
            let url = params.get("url").and_then(|v| v.as_str())
                .ok_or("Missing 'url' parameter")?;
            open_external(url)?;
            Ok(json!(true))
        }

        "shell.openPath" => {
            let path = params.get("path").and_then(|v| v.as_str())
                .ok_or("Missing 'path' parameter")?;
            open_path(path)?;
            Ok(json!(true))
        }

        "shell.execCommand" => {
            let command = params.get("command").and_then(|v| v.as_str())
                .ok_or("Missing 'command' parameter")?;
            let cwd = params.get("cwd").and_then(|v| v.as_str());
            let env = params.get("env");
            exec_command(command, cwd, env)
        }

        "shell.trashItem" => {
            let path = params.get("path").and_then(|v| v.as_str())
                .ok_or("Missing 'path' parameter")?;
            trash::delete(path)
                .map_err(|e| format!("Failed to trash item: {}", e))?;
            Ok(json!(true))
        }

        _ => Err(format!("Unknown method: {}", method)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_exec_command_echo() {
        let (cmd, expected) = if cfg!(windows) {
            ("echo hello", "hello")
        } else {
            ("echo hello", "hello")
        };
        let result = handle("shell.execCommand", &json!({"command": cmd})).unwrap();
        assert_eq!(result["code"], json!(0));
        assert!(result["success"].as_bool().unwrap());
        let stdout = result["stdout"].as_str().unwrap();
        assert!(stdout.contains(expected), "stdout should contain '{}', got: '{}'", expected, stdout);
    }

    #[test]
    fn test_exec_command_failure() {
        let cmd = if cfg!(windows) {
            "cmd /c exit 1"
        } else {
            "sh -c 'exit 1'"
        };
        let result = handle("shell.execCommand", &json!({"command": cmd})).unwrap();
        assert!(!result["success"].as_bool().unwrap());
    }

    #[test]
    fn test_exec_command_with_cwd() {
        let tmp = std::env::temp_dir().to_string_lossy().to_string();
        let cmd = if cfg!(windows) { "cd" } else { "pwd" };
        let result = handle("shell.execCommand", &json!({
            "command": cmd,
            "cwd": tmp
        })).unwrap();
        assert_eq!(result["code"], json!(0));
    }

    #[test]
    fn test_exec_command_missing_command() {
        let result = handle("shell.execCommand", &json!({}));
        assert!(result.is_err());
    }

    #[test]
    fn test_unknown_method() {
        assert!(handle("shell.unknownMethod", &json!({})).is_err());
    }
}