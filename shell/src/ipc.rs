use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use tao::event_loop::EventLoopProxy;

#[derive(Deserialize, Debug)]
pub struct IpcRequest {
    pub id: u64,
    pub method: String,
    #[serde(default)]
    pub params: serde_json::Value,
}

#[derive(Serialize)]
struct IpcResponse {
    id: u64,
    result: Option<serde_json::Value>,
    error: Option<String>,
}

// 用 thread_local 代替 static，因为 WebView 不是 Sync
thread_local! {
    static WEBVIEW: RefCell<Option<wry::WebView>> = RefCell::new(None);
    static PROXY: RefCell<Option<EventLoopProxy<crate::IpcTask>>> = RefCell::new(None);
}

pub fn set_proxy(proxy: EventLoopProxy<crate::IpcTask>) {
    PROXY.with(|p| {
        *p.borrow_mut() = Some(proxy);
    });
}

pub fn init(webview: wry::WebView) {
    WEBVIEW.with(|w| {
        *w.borrow_mut() = Some(webview);
    });
}

pub fn handle_message(request: wry::http::Request<String>) {
    let body = request.into_body();
    PROXY.with(|p| {
        if let Some(proxy) = p.borrow().as_ref() {
            let _ = proxy.send_event(crate::IpcTask::HandleRequest { body });
        }
    });
}

pub fn process_request(body: &str) {
    let req: IpcRequest = match serde_json::from_str(body) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[IPC] Invalid message: {}", e);
            return;
        }
    };

    eprintln!("[IPC] {}", req.method);

    let response = match dispatch(&req.method, &req.params) {
        Ok(result) => IpcResponse { id: req.id, result: Some(result), error: None },
        Err(err) => IpcResponse { id: req.id, result: None, error: Some(err) },
    };

    WEBVIEW.with(|w| {
        if let Some(wv) = w.borrow_mut().as_ref() {
            let json = serde_json::to_string(&response).unwrap_or_default();
            let script = format!(
                "window.__VOKEX_IPC__ && window.__VOKEX_IPC__({})",
                json
            );
            let _ = wv.evaluate_script(&script);
        }
    });
}

fn dispatch(method: &str, _params: &serde_json::Value) -> Result<serde_json::Value, String> {
    match method {
        "app.getName" => {
            let config = crate::app_config::get_config();
            Ok(serde_json::json!(config.name))
        }
        "app.getVersion" => {
            let config = crate::app_config::get_config();
            Ok(serde_json::json!(config.version))
        }
        "app.getIdentifier" => {
            let config = crate::app_config::get_config();
            Ok(serde_json::json!(config.identifier))
        }
        _ => Err(format!("Unknown method: {}", method)),
    }
}

pub fn get_init_script() -> &'static str {
    r#"
    (function() {
        var _pendingCalls = new Map();
        var _callId = 0;

        window.__VOKEX__ = {
            call: function(method, params) {
                var id = ++_callId;
                return new Promise(function(resolve, reject) {
                    _pendingCalls.set(id, { resolve: resolve, reject: reject });
                    window.ipc.postMessage(JSON.stringify({
                        id: id,
                        method: method,
                        params: params || {}
                    }));
                });
            },
            on: function(event, listener) {},
            off: function(event, listener) {},
            __emit__: function(event, data) {}
        };

        window.__VOKEX_IPC__ = function(response) {
            var callback = _pendingCalls.get(response.id);
            if (callback) {
                _pendingCalls.delete(response.id);
                if (response.error) {
                    callback.reject(new Error(response.error));
                } else {
                    callback.resolve(response.result);
                }
            }
        };
    })();
    "#
}