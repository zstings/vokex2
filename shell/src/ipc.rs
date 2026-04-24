use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use tao::event_loop::EventLoopProxy;

#[derive(Deserialize, Debug)]
pub struct IpcRequest {
    pub id: u64,
    pub method: String,
    #[serde(default)]
    pub params: serde_json::Value,
    #[serde(default)]
    pub window_id: u32,
}

#[derive(Serialize)]
struct IpcResponse {
    id: u64,
    result: Option<serde_json::Value>,
    error: Option<String>,
}

thread_local! {
    static PROXY: RefCell<Option<EventLoopProxy<crate::IpcTask>>> = RefCell::new(None);
}

pub fn set_proxy(proxy: EventLoopProxy<crate::IpcTask>) {
    PROXY.with(|p| {
        *p.borrow_mut() = Some(proxy);
    });
}

pub fn handle_message(window_id: u32, request: wry::http::Request<String>) {
    let body = request.into_body();
    PROXY.with(|p| {
        if let Some(proxy) = p.borrow().as_ref() {
            let _ = proxy.send_event(crate::IpcTask::HandleRequest { window_id, body });
        }
    });
}

pub fn process_request(window_id: u32, body: &str) {
    let req: IpcRequest = match serde_json::from_str(body) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[IPC] Invalid message: {}", e);
            return;
        }
    };

    eprintln!("[IPC] window_id={}, method={}", window_id, req.method);

    let response = match dispatch(&req.method, &req.params) {
        Ok(result) => IpcResponse { id: req.id, result: Some(result), error: None },
        Err(err) => IpcResponse { id: req.id, result: None, error: Some(err) },
    };

    let json = serde_json::to_string(&response).unwrap_or_default();
    let script = format!(
        "window.__VOKEX_IPC__ && window.__VOKEX_IPC__({})",
        json
    );
    crate::window_manager::eval(window_id, &script);
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

/// 向指定窗口推送事件
pub fn emit(window_id: u32, event: &str, data: serde_json::Value) {
    let event_escaped = event.replace('\\', "\\\\").replace('\'', "\\'");
    let data_json = serde_json::to_string(&data).unwrap_or("null".to_string());
    let script = format!(
        "window.__VOKEX__ && window.__VOKEX__.__emit__('{}', {})",
        event_escaped, data_json
    );
    crate::window_manager::eval(window_id, &script);
}

/// 向所有窗口推送事件
pub fn emit_all(event: &str, data: serde_json::Value) {
    let event_escaped = event.replace('\\', "\\\\").replace('\'', "\\'");
    let data_json = serde_json::to_string(&data).unwrap_or("null".to_string());
    let script = format!(
        "window.__VOKEX__ && window.__VOKEX__.__emit__('{}', {})",
        event_escaped, data_json
    );
    crate::window_manager::eval_all(&script);
}

pub fn get_init_script(window_id: u32) -> String {
    r#"
    (function() {
        var _pendingCalls = new Map();
        var _callId = 0;
        var _windowId = __WINDOW_ID__;

        window.__VOKEX__ = {
            __windowId__: _windowId,
            call: function(method, params) {
                var id = ++_callId;
                return new Promise(function(resolve, reject) {
                    _pendingCalls.set(id, { resolve: resolve, reject: reject });
                    window.ipc.postMessage(JSON.stringify({
                        id: id,
                        method: method,
                        params: params || {},
                        windowId: _windowId
                    }));
                });
            },
            on: function(event, listener) {
                if (!this.__eventListeners) this.__eventListeners = {};
                if (!this.__eventListeners[event]) this.__eventListeners[event] = [];
                this.__eventListeners[event].push(listener);
                return listener;
            },
            off: function(event, listener) {
                if (!this.__eventListeners || !this.__eventListeners[event]) return;
                this.__eventListeners[event] = this.__eventListeners[event].filter(function(l) { return l !== listener; });
            },
            __emit__: function(event, data) {
                if (!this.__eventListeners || !this.__eventListeners[event]) return;
                var listeners = this.__eventListeners[event];
                for (var i = 0; i < listeners.length; i++) {
                    try { listeners[i](data); } catch(e) { console.error('Event listener error:', e); }
                }
            }
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
    .replace("__WINDOW_ID__", &window_id.to_string())
}