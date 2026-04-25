use serde_json::{json, Value};

pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "clipboard.readText" => {
            let mut clipboard = arboard::Clipboard::new()
                .map_err(|e| format!("Failed to open clipboard: {}", e))?;
            let text = clipboard.get_text()
                .unwrap_or_default();
            Ok(json!(text))
        }

        "clipboard.writeText" => {
            let text = params.get("text").and_then(|v| v.as_str())
                .ok_or("Missing 'text' parameter")?;
            let mut clipboard = arboard::Clipboard::new()
                .map_err(|e| format!("Failed to open clipboard: {}", e))?;
            clipboard.set_text(text.to_string())
                .map_err(|e| format!("Failed to write clipboard: {}", e))?;
            Ok(json!(true))
        }

        "clipboard.clear" => {
            let mut clipboard = arboard::Clipboard::new()
                .map_err(|e| format!("Failed to open clipboard: {}", e))?;
            clipboard.clear()
                .map_err(|e| format!("Failed to clear clipboard: {}", e))?;
            Ok(json!(true))
        }

        _ => Err(format!("Unknown method: {}", method)),
    }
}