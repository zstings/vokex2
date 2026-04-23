use serde_json::{json, Value};

pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "notification.show" => {
            let title = params.get("title").and_then(|v| v.as_str())
                .ok_or("Missing 'title' parameter")?;
            let body = params.get("body").and_then(|v| v.as_str()).unwrap_or("");

            notify_rust::Notification::new()
                .summary(title)
                .body(body)
                .show()
                .map_err(|e| format!("Failed to show notification: {}", e))?;

            Ok(json!(true))
        }
        _ => Err(format!("Unknown method: {}", method)),
    }
}