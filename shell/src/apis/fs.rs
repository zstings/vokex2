use serde_json::{json, Value};
use std::io::Write;

/// 处理 fs 模块的 API 调用
pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "fs.readFile" => read_file(params),
        "fs.readFileBinary" => read_file_binary(params),
        "fs.writeFile" => write_file(params),
        "fs.appendFile" => append_file(params),
        "fs.deleteFile" => delete_file(params),
        "fs.readDir" => read_dir(params),
        "fs.createDir" => create_dir(params),
        "fs.removeDir" => remove_dir(params),
        "fs.stat" => stat(params),
        "fs.exists" => exists(params),
        "fs.copyFile" => copy_file(params),
        "fs.moveFile" => move_file(params),
        _ => Err(format!("Unknown fs method: {}", method)),
    }
}

fn read_file(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    std::fs::read_to_string(path)
        .map(|content| json!(content))
        .map_err(|e| e.to_string())
}

fn read_file_binary(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
    // 返回 base64 编码，比字节数组更紧凑
    Ok(json!(base64_encode(&bytes)))
}

fn write_file(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    let data = params.get("data").and_then(|v| v.as_str()).ok_or("Missing param: data")?;
    std::fs::write(path, data)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn append_file(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    let data = params.get("data").and_then(|v| v.as_str()).ok_or("Missing param: data")?;
    std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .and_then(|mut file| file.write_all(data.as_bytes()))
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn delete_file(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    std::fs::remove_file(path)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn read_dir(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
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

fn create_dir(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    std::fs::create_dir_all(path)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn remove_dir(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    std::fs::remove_dir_all(path)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn stat(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
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

fn exists(params: &Value) -> Result<Value, String> {
    let path = params.get("path").and_then(|v| v.as_str()).ok_or("Missing param: path")?;
    Ok(json!(std::path::Path::new(path).exists()))
}

fn copy_file(params: &Value) -> Result<Value, String> {
    let source = params.get("source").and_then(|v| v.as_str()).ok_or("Missing param: source")?;
    let destination = params.get("destination").and_then(|v| v.as_str()).ok_or("Missing param: destination")?;
    std::fs::copy(source, destination)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

fn move_file(params: &Value) -> Result<Value, String> {
    let source = params.get("source").and_then(|v| v.as_str()).ok_or("Missing param: source")?;
    let destination = params.get("destination").and_then(|v| v.as_str()).ok_or("Missing param: destination")?;
    std::fs::rename(source, destination)
        .map(|_| json!(null))
        .map_err(|e| e.to_string())
}

/// 简单的 base64 编码（不引入额外依赖）
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