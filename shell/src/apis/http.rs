use serde_json::{json, Value};
use minreq::Method;

pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "http.request" => {
            let url = params.get("url").and_then(|v| v.as_str())
                .ok_or("Missing 'url' parameter")?;
            let http_method = params.get("method").and_then(|v| v.as_str()).unwrap_or("GET").to_uppercase();
            let headers = params.get("headers").cloned().unwrap_or(json!({}));
            let body = params.get("body").and_then(|v| v.as_str());
            let timeout = params.get("timeout").and_then(|v| v.as_u64()).unwrap_or(30);

            let method_enum = match http_method.as_str() {
                "GET" => Method::Get,
                "POST" => Method::Post,
                "PUT" => Method::Put,
                "DELETE" => Method::Delete,
                "PATCH" => Method::Patch,
                "HEAD" => Method::Head,
                "OPTIONS" => Method::Options,
                _ => return Err(format!("Unsupported HTTP method: {}", http_method)),
            };

            let mut request = minreq::Request::new(method_enum, url)
                .with_timeout(timeout);

            if let Some(obj) = headers.as_object() {
                for (key, val) in obj {
                    if let Some(s) = val.as_str() {
                        request = request.with_header(key, s);
                    }
                }
            }

            if let Some(b) = body {
                request = request.with_body(b);
            }

            let response = request.send()
                .map_err(|e| format!("HTTP request failed: {}", e))?;

            let status = response.status_code;
            let body_str = response.as_str().unwrap_or("").to_string();

            Ok(json!({
                "statusCode": status,
                "body": body_str,
                "ok": status >= 200 && status < 300
            }))
        }
        _ => Err(format!("Unknown method: {}", method)),
    }
}