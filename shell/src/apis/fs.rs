use serde_json::{json, Value};
use std::io::Write;
use std::path::{Path, PathBuf};

/// 将配置中的占位符展开为实际路径
fn expand_placeholder(placeholder: &str, identifier: &str) -> PathBuf {
    match placeholder {
        "{appData}" | "{userData}" => {
            let base = dirs::data_dir()
                .unwrap_or_else(|| PathBuf::from("."));
            base.join(identifier)
        }
        "{temp}" => std::env::temp_dir(),
        "{home}" => dirs::home_dir().unwrap_or_else(|| PathBuf::from(".")),
        "{desktop}" => dirs::desktop_dir().unwrap_or_else(|| PathBuf::from(".")),
        "{documents}" => dirs::document_dir().unwrap_or_else(|| PathBuf::from(".")),
        other => PathBuf::from(other),
    }
}

/// 标准化路径：解析 `..`、`.`，处理 Windows 前缀
fn normalize_path(path: &str) -> PathBuf {
    let p = Path::new(path);
    // 尝试 canonicalize，如果路径不存在则手动 normalize
    std::fs::canonicalize(p).unwrap_or_else(|_| {
        let mut components = Vec::new();
        for comp in p.components() {
            match comp {
                std::path::Component::ParentDir => { components.pop(); }
                std::path::Component::CurDir => {}
                other => components.push(other),
            }
        }
        components.iter().collect()
    })
}

/// 检查路径是否在沙箱内
pub fn check_path_sandbox(path: &str, window_id: u32) -> Result<(), String> {
    let perms = crate::apis::permissions::get_permissions(window_id);
    let sandbox = &perms.fs.sandbox;

    // 空 sandbox = 不限制（主窗口默认行为）
    if sandbox.is_empty() {
        return Ok(());
    }

    let config = crate::app_config::get_config();
    let normalized = normalize_path(path);

    for allowed_prefix in sandbox {
        let expanded = expand_placeholder(allowed_prefix, &config.identifier);
        let expanded_normalized = normalize_path(&expanded.to_string_lossy());
        if normalized.starts_with(&expanded_normalized) {
            return Ok(());
        }
    }

    Err(format!("Path access denied: '{}' is outside allowed sandbox", path))
}

/// 处理 fs 模块的 API 调用
pub fn handle(method: &str, params: &Value, window_id: u32) -> Result<Value, String> {
    match method {
        "fs.readFile" => read_file(params, window_id),
        "fs.readFileBinary" => read_file_binary(params, window_id),
        "fs.writeFile" => write_file(params, window_id),
        "fs.appendFile" => append_file(params, window_id),
        "fs.deleteFile" => delete_file(params, window_id),
        "fs.readDir" => read_dir(params, window_id),
        "fs.createDir" => create_dir(params, window_id),
        "fs.removeDir" => remove_dir(params, window_id),
        "fs.stat" => stat(params, window_id),
        "fs.exists" => exists(params, window_id),
        "fs.copyFile" => copy_file(params, window_id),
        "fs.moveFile" => move_file(params, window_id),
        _ => Err(format!("Unknown fs method: {}", method)),
    }
}

fn read_file(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    std::fs::read_to_string(path)
        .map(|content| json!(content))
        .map_err(|e| e.to_string())
}

fn read_file_binary(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
    // 返回 base64 编码，比字节数组更紧凑
    Ok(json!(base64_encode(&bytes)))
}

fn write_file(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    let data = params.get("data").and_then(|v| v.as_str()).ok_or("Missing param: data")?;
    std::fs::write(path, data)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn append_file(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    let data = params.get("data").and_then(|v| v.as_str()).ok_or("Missing param: data")?;
    std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .and_then(|mut file| file.write_all(data.as_bytes()))
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn delete_file(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    std::fs::remove_file(path)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn read_dir(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    let entries = std::fs::read_dir(path).map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for entry in entries {
        if let Ok(entry) = entry {
            let name = entry.file_name().into_string().unwrap_or_default();
            let is_dir = entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false);
            result.push(json!({
                "name": name,
                "isDir": is_dir
            }));
        }
    }
    Ok(json!(result))
}

fn create_dir(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    std::fs::create_dir_all(path)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn remove_dir(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    std::fs::remove_dir_all(path)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn stat(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    let metadata = std::fs::metadata(path).map_err(|e| e.to_string())?;
    let modified = metadata.modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as u64)
        .unwrap_or(0);
    Ok(json!({
        "isFile": metadata.is_file(),
        "isDir": metadata.is_dir(),
        "size": metadata.len(),
        "modified": modified
    }))
}

fn exists(params: &Value, window_id: u32) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    check_path_sandbox(path, window_id)?;
    Ok(json!(std::path::Path::new(path).exists()))
}

fn copy_file(params: &Value, window_id: u32) -> Result<Value, String> {
    let source = params.get("source").and_then(|v| v.as_str()).ok_or("Missing param: source")?;
    let destination = params.get("destination").and_then(|v| v.as_str()).ok_or("Missing param: destination")?;
    check_path_sandbox(source, window_id)?;
    check_path_sandbox(destination, window_id)?;
    std::fs::copy(source, destination)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn move_file(params: &Value, window_id: u32) -> Result<Value, String> {
    let source = params.get("source").and_then(|v| v.as_str()).ok_or("Missing param: source")?;
    let destination = params.get("destination").and_then(|v| v.as_str()).ok_or("Missing param: destination")?;
    check_path_sandbox(source, window_id)?;
    check_path_sandbox(destination, window_id)?;
    std::fs::rename(source, destination)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn base64_encode(bytes: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    for chunk in bytes.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let n = (b0 << 16) | (b1 << 8) | b2;
        result.push(CHARS[((n >> 18) & 0x3F) as usize] as char);
        result.push(CHARS[((n >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            result.push(CHARS[((n >> 6) & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
        if chunk.len() > 2 {
            result.push(CHARS[(n & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::fs;

    fn temp_path(name: &str) -> String {
        std::env::temp_dir()
            .join(format!("vokex_test_{}", name))
            .to_string_lossy()
            .to_string()
    }

    fn cleanup(path: &str) {
        let p = std::path::Path::new(path);
        if p.is_dir() {
            let _ = fs::remove_dir_all(p);
        } else if p.exists() {
            let _ = fs::remove_file(p);
        }
    }

    #[test]
    fn test_write_and_read_file() {
        let path = temp_path("rw.txt");
        cleanup(&path);

        handle("fs.writeFile", &json!({"path": path, "data": "你好 vokex"})).unwrap();
        let result = handle("fs.readFile", &json!({"path": path})).unwrap();
        assert_eq!(result, json!("你好 vokex"));

        cleanup(&path);
    }

    #[test]
    fn test_read_nonexistent_file() {
        let result = handle("fs.readFile", &json!({"path": "/nonexistent/path/file.txt"}));
        assert!(result.is_err());
    }

    #[test]
    fn test_write_and_read_binary() {
        let path = temp_path("binary.bin");
        cleanup(&path);

        let data: Vec<u8> = vec![0, 1, 2, 255, 254, 253];
        fs::write(&path, &data).unwrap();

        let result = handle("fs.readFileBinary", &json!({"path": path})).unwrap();
        let b64 = result.as_str().unwrap();
        // 验证返回的是 base64 字符串
        assert!(!b64.is_empty());

        cleanup(&path);
    }

    #[test]
    fn test_append_file() {
        let path = temp_path("append.txt");
        cleanup(&path);

        handle("fs.writeFile", &json!({"path": path, "data": "第一行\n"})).unwrap();
        handle("fs.appendFile", &json!({"path": path, "data": "第二行"})).unwrap();
        let result = handle("fs.readFile", &json!({"path": path})).unwrap();
        assert_eq!(result, json!("第一行\n第二行"));

        cleanup(&path);
    }

    #[test]
    fn test_delete_file() {
        let path = temp_path("delete.txt");
        cleanup(&path);

        handle("fs.writeFile", &json!({"path": path, "data": "tmp"})).unwrap();
        assert!(handle("fs.exists", &json!({"path": path})).unwrap().as_bool().unwrap());

        handle("fs.deleteFile", &json!({"path": path})).unwrap();
        assert!(!handle("fs.exists", &json!({"path": path})).unwrap().as_bool().unwrap());
    }

    #[test]
    fn test_create_and_read_dir() {
        let dir = temp_path("testdir");
        cleanup(&dir);

        handle("fs.createDir", &json!({"path": dir})).unwrap();
        // 在目录里创建几个文件
        fs::write(std::path::Path::new(&dir).join("a.txt"), "a").unwrap();
        fs::write(std::path::Path::new(&dir).join("b.txt"), "b").unwrap();

        let result = handle("fs.readDir", &json!({"path": dir})).unwrap();
        let entries: Vec<_> = result.as_array().unwrap().iter()
            .map(|e| e["name"].as_str().unwrap().to_string())
            .collect();
        assert!(entries.contains(&"a.txt".to_string()));
        assert!(entries.contains(&"b.txt".to_string()));

        cleanup(&dir);
    }

    #[test]
    fn test_remove_dir() {
        let dir = temp_path("rmdir");
        cleanup(&dir);

        fs::create_dir_all(std::path::Path::new(&dir).join("sub")).unwrap();
        handle("fs.writeFile", &json!({"path": format!("{}/sub/f.txt", dir), "data": "x"})).unwrap();

        handle("fs.removeDir", &json!({"path": dir})).unwrap();
        assert!(!handle("fs.exists", &json!({"path": dir})).unwrap().as_bool().unwrap());
    }

    #[test]
    fn test_stat_file() {
        let path = temp_path("stat.txt");
        cleanup(&path);

        handle("fs.writeFile", &json!({"path": path, "data": "hello world"})).unwrap();
        let result = handle("fs.stat", &json!({"path": path})).unwrap();

        assert_eq!(result["isFile"], json!(true));
        assert_eq!(result["isDir"], json!(false));
        assert_eq!(result["size"], json!(11));
        assert!(result["modified"].as_u64().unwrap() > 0);

        cleanup(&path);
    }

    #[test]
    fn test_exists() {
        let path = temp_path("exists.txt");
        cleanup(&path);

        assert!(!handle("fs.exists", &json!({"path": path})).unwrap().as_bool().unwrap());
        handle("fs.writeFile", &json!({"path": path, "data": "x"})).unwrap();
        assert!(handle("fs.exists", &json!({"path": path})).unwrap().as_bool().unwrap());

        cleanup(&path);
    }

    #[test]
    fn test_copy_file() {
        let src = temp_path("copy_src.txt");
        let dst = temp_path("copy_dst.txt");
        cleanup(&src);
        cleanup(&dst);

        handle("fs.writeFile", &json!({"path": src, "data": "copy me"})).unwrap();
        handle("fs.copyFile", &json!({"source": src, "destination": dst})).unwrap();

        let result = handle("fs.readFile", &json!({"path": dst})).unwrap();
        assert_eq!(result, json!("copy me"));

        cleanup(&src);
        cleanup(&dst);
    }

    #[test]
    fn test_move_file() {
        let src = temp_path("move_src.txt");
        let dst = temp_path("move_dst.txt");
        cleanup(&src);
        cleanup(&dst);

        handle("fs.writeFile", &json!({"path": src, "data": "move me"})).unwrap();
        handle("fs.moveFile", &json!({"source": src, "destination": dst})).unwrap();

        assert!(!handle("fs.exists", &json!({"path": src})).unwrap().as_bool().unwrap());
        let result = handle("fs.readFile", &json!({"path": dst})).unwrap();
        assert_eq!(result, json!("move me"));

        cleanup(&dst);
    }

    #[test]
    fn test_missing_params() {
        assert!(handle("fs.readFile", &json!({})).is_err());
        assert!(handle("fs.writeFile", &json!({"path": "/tmp/t"})).is_err());
        assert!(handle("fs.writeFile", &json!({"data": "x"})).is_err());
    }

    #[test]
    fn test_unknown_method() {
        assert!(handle("fs.unknownMethod", &json!({})).is_err());
    }
}
