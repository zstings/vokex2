use serde_json::{json, Value};
use minreq::Method;
use std::net::IpAddr;

/// 提取 URL 中的 host
fn extract_host(url: &str) -> Option<String> {
    let after_scheme = if let Some(pos) = url.find("://") {
        &url[pos + 3..]
    } else {
        url
    };
    let host_port = after_scheme.split('/').next()?;
    let host = if host_port.starts_with('[') {
        // IPv6: [::1]:8080
        host_port.strip_prefix('[')?.split(']').next()?.to_string()
    } else {
        host_port.split(':').next()?.to_string()
    };
    if host.is_empty() { None } else { Some(host) }
}

/// 检查是否为内网 IP
fn is_internal_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => {
            v4.is_loopback()           // 127.0.0.0/8
            || v4.is_private()         // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
            || v4.is_link_local()      // 169.254.0.0/16
            || v4.is_unspecified()     // 0.0.0.0
        }
        IpAddr::V6(v6) => {
            v6.is_loopback()           // ::1
            || {
                // 检查 IPv4-mapped IPv6 地址 (::ffff:127.0.0.1 等)
                if let Some(v4) = v6.to_ipv4_mapped() {
                    is_internal_ip(IpAddr::V4(v4))
                } else {
                    false
                }
            }
        }
    }
}

/// 检查 URL 是否指向内网地址
fn is_internal_url(url: &str) -> bool {
    let host = extract_host(url);
    if let Some(host_str) = host {
        let lower = host_str.to_lowercase();
        // 检查域名黑名单
        if lower == "localhost" || lower.ends_with(".local") || lower.ends_with(".internal") {
            return true;
        }
        // 尝试解析为 IP
        if let Ok(ip) = host_str.parse::<IpAddr>() {
            return is_internal_ip(ip);
        }
        // DNS 解析后检查
        use std::net::ToSocketAddrs;
        if let Ok(addrs) = (host_str.as_str(), 0u16).to_socket_addrs() {
            for addr in addrs {
                if is_internal_ip(addr.ip()) {
                    return true;
                }
            }
        }
    }
    false
}

pub fn handle(method: &str, params: &Value, window_id: u32) -> Result<Value, String> {
    match method {
        "http.request" => {
            let url = params.get("url").and_then(|v| v.as_str())
                .ok_or("Missing 'url' parameter")?;

            // 权限检查：阻止内网地址
            let perms = crate::apis::permissions::get_permissions(window_id);
            if perms.http.block_internal && is_internal_url(url) {
                return Err("HTTP request blocked: internal network addresses are not allowed".to_string());
            }

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

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_missing_url() {
        let result = handle("http.request", &json!({}));
        assert!(result.is_err());
    }

    #[test]
    fn test_unsupported_method() {
        let result = handle("http.request", &json!({
            "url": "http://example.com",
            "method": "INVALID"
        }));
        assert!(result.is_err());
    }

    #[test]
    fn test_unknown_method() {
        assert!(handle("http.unknownMethod", &json!({})).is_err());
    }

    #[test]
    fn test_request_to_closed_port() {
        // 连接到一个未开放的端口，应快速失败
        let result = handle("http.request", &json!({
            "url": "http://127.0.0.1:1/",
            "method": "GET",
            "timeout": 2
        }));
        assert!(result.is_err());
    }
}