use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

/// 全局存储缓存，避免每次都读文件
static STORAGE_CACHE: Mutex<Option<HashMap<String, Value>>> = Mutex::new(None);

/// 获取存储文件路径
fn get_storage_path() -> Result<PathBuf, String> {
    let config = crate::app_config::get_config();
    let data_dir = if let Some(local_appdata) = std::env::var_os("LOCALAPPDATA") {
        PathBuf::from(local_appdata).join(&config.identifier)
    } else if let Some(home) = std::env::var_os("HOME") {
        PathBuf::from(home).join(format!(".{}", config.identifier))
    } else {
        return Err("Cannot determine data directory".to_string());
    };
    fs::create_dir_all(&data_dir).map_err(|e| format!("Failed to create data dir: {}", e))?;
    Ok(data_dir.join("storage.json"))
}

/// 从文件加载存储到缓存
fn load_storage() -> Result<HashMap<String, Value>, String> {
    let path = get_storage_path()?;
    if !path.exists() {
        return Ok(HashMap::new());
    }
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read storage: {}", e))?;
    let map: HashMap<String, Value> = serde_json::from_str(&content)
        .unwrap_or_else(|_| HashMap::new());
    Ok(map)
}

/// 将缓存写入文件
fn save_storage(map: &HashMap<String, Value>) -> Result<(), String> {
    let path = get_storage_path()?;
    let content = serde_json::to_string_pretty(map)
        .map_err(|e| format!("Failed to serialize storage: {}", e))?;
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write storage: {}", e))?;
    Ok(())
}

/// 确保缓存已加载
fn ensure_cache() -> Result<(), String> {
    let mut cache = STORAGE_CACHE.lock().unwrap();
    if cache.is_none() {
        *cache = Some(load_storage()?);
    }
    Ok(())
}

pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "storage.setData" => {
            let key = params.get("key").and_then(|v| v.as_str())
                .ok_or("Missing 'key' parameter")?;
            let value = params.get("value")
                .ok_or("Missing 'value' parameter")?;
            ensure_cache()?;
            let mut cache = STORAGE_CACHE.lock().unwrap();
            if let Some(map) = cache.as_mut() {
                map.insert(key.to_string(), value.clone());
                save_storage(map)?;
            }
            Ok(json!(true))
        }

        "storage.getData" => {
            let key = params.get("key").and_then(|v| v.as_str())
                .ok_or("Missing 'key' parameter")?;
            ensure_cache()?;
            let cache = STORAGE_CACHE.lock().unwrap();
            if let Some(map) = cache.as_ref() {
                Ok(map.get(key).cloned().unwrap_or(Value::Null))
            } else {
                Ok(Value::Null)
            }
        }

        "storage.getKeys" => {
            ensure_cache()?;
            let cache = STORAGE_CACHE.lock().unwrap();
            if let Some(map) = cache.as_ref() {
                let keys: Vec<&String> = map.keys().collect();
                Ok(json!(keys))
            } else {
                Ok(json!([]))
            }
        }

        "storage.has" => {
            let key = params.get("key").and_then(|v| v.as_str())
                .ok_or("Missing 'key' parameter")?;
            ensure_cache()?;
            let cache = STORAGE_CACHE.lock().unwrap();
            if let Some(map) = cache.as_ref() {
                Ok(json!(map.contains_key(key)))
            } else {
                Ok(json!(false))
            }
        }

        "storage.removeData" => {
            let key = params.get("key").and_then(|v| v.as_str())
                .ok_or("Missing 'key' parameter")?;
            ensure_cache()?;
            let mut cache = STORAGE_CACHE.lock().unwrap();
            if let Some(map) = cache.as_mut() {
                map.remove(key);
                save_storage(map)?;
            }
            Ok(json!(true))
        }

        "storage.clear" => {
            let mut cache = STORAGE_CACHE.lock().unwrap();
            *cache = Some(HashMap::new());
            save_storage(cache.as_ref().unwrap())?;
            Ok(json!(true))
        }

        _ => Err(format!("Unknown method: {}", method)),
    }
}