use serde_json::{json, Value};
use tao::dpi::{LogicalPosition, LogicalSize};

#[cfg(target_os = "windows")]
#[repr(C)]
struct FLASHWINFO {
    cb_size: u32,
    hwnd: isize,
    dw_flags: u32,
    u_count: u32,
    dw_timeout: u32,
}

#[cfg(target_os = "windows")]
extern "system" {
    fn GetSystemMetrics(index: i32) -> i32;
    fn GetWindowLongW(hwnd: isize, index: i32) -> i32;
    fn SetWindowLongW(hwnd: isize, index: i32, value: i32) -> i32;
    fn SetLayeredWindowAttributes(hwnd: isize, crkey: u32, balpha: u8, flags: u32) -> i32;
    fn FlashWindowEx(info: *const FLASHWINFO) -> i32;
}


/// browserWindow 模块 API 处理
/// 注意：browserWindow.create 在 ipc.rs 中被拦截，直接走 CreateWindow 事件
pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "browserWindow.getAll" => get_all(params),
        "browserWindow.getFocused" => get_focused(params),
        "browserWindow.getById" => get_by_id(params),
        "browserWindow.close" => with_window(params, |w| { w.window.set_visible(false); Ok(json!(true)) }),
        "browserWindow.show" => with_window(params, |w| { w.window.set_visible(true); Ok(json!(true)) }),
        "browserWindow.hide" => with_window(params, |w| { w.window.set_visible(false); Ok(json!(true)) }),
        "browserWindow.minimize" => with_window(params, |w| { w.window.set_minimized(true); Ok(json!(true)) }),
        "browserWindow.maximize" => with_window(params, |w| { w.window.set_maximized(true); Ok(json!(true)) }),
        "browserWindow.unmaximize" => with_window(params, |w| { w.window.set_maximized(false); Ok(json!(true)) }),
        "browserWindow.restore" => with_window(params, |w| { w.window.set_minimized(false); w.window.set_maximized(false); Ok(json!(true)) }),
        "browserWindow.focus" => with_window(params, |w| { w.window.set_focus(); Ok(json!(true)) }),
        "browserWindow.isMaximized" => with_window(params, |w| Ok(json!(w.window.is_maximized()))),
        "browserWindow.isMinimized" => with_window(params, |w| Ok(json!(w.window.is_minimized()))),
        "browserWindow.isFullScreen" => with_window(params, |w| Ok(json!(w.window.fullscreen().is_some()))),
        "browserWindow.isFocused" => with_window(params, |w| Ok(json!(w.window.is_focused()))),
        "browserWindow.isVisible" => with_window(params, |w| Ok(json!(w.window.is_visible()))),
        "browserWindow.isResizable" => with_window(params, |w| Ok(json!(w.window.is_resizable()))),
        "browserWindow.setFullScreen" => with_window(params, |w| {
            let flag = params.get("flag").and_then(|v| v.as_bool()).unwrap_or(true);
            if flag {
                w.window.set_fullscreen(Some(tao::window::Fullscreen::Borderless(None)));
            } else {
                w.window.set_fullscreen(None);
            }
            Ok(json!(true))
        }),
        "browserWindow.setTitle" => with_window(params, |w| {
            let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("");
            w.window.set_title(title);
            Ok(json!(true))
        }),
        "browserWindow.getTitle" => with_window(params, |w| Ok(json!(w.window.title()))),
        "browserWindow.setSize" => with_window(params, |w| {
            let width = params.get("width").and_then(|v| v.as_f64()).unwrap_or(800.0);
            let height = params.get("height").and_then(|v| v.as_f64()).unwrap_or(600.0);
            w.window.set_inner_size(LogicalSize::new(width, height));
            Ok(json!(true))
        }),
        "browserWindow.getSize" => with_window(params, |w| {
            let size = w.window.inner_size();
            Ok(json!([size.width, size.height]))
        }),
        "browserWindow.setMinimumSize" => with_window(params, |w| {
            let width = params.get("width").and_then(|v| v.as_f64()).unwrap_or(0.0);
            let height = params.get("height").and_then(|v| v.as_f64()).unwrap_or(0.0);
            w.window.set_min_inner_size(Some(LogicalSize::new(width, height)));
            Ok(json!(true))
        }),
        "browserWindow.setMaximumSize" => with_window(params, |w| {
            let width = params.get("width").and_then(|v| v.as_f64()).unwrap_or(0.0);
            let height = params.get("height").and_then(|v| v.as_f64()).unwrap_or(0.0);
            w.window.set_max_inner_size(Some(LogicalSize::new(width, height)));
            Ok(json!(true))
        }),
        "browserWindow.setResizable" => with_window(params, |w| {
            let flag = params.get("flag").and_then(|v| v.as_bool()).unwrap_or(true);
            w.window.set_resizable(flag);
            Ok(json!(true))
        }),
        "browserWindow.setAlwaysOnTop" => with_window(params, |w| {
            let flag = params.get("flag").and_then(|v| v.as_bool()).unwrap_or(false);
            w.window.set_always_on_top(flag);
            Ok(json!(true))
        }),
        "browserWindow.setPosition" => with_window(params, |w| {
            let x = params.get("x").and_then(|v| v.as_f64()).unwrap_or(0.0);
            let y = params.get("y").and_then(|v| v.as_f64()).unwrap_or(0.0);
            w.window.set_outer_position(LogicalPosition::new(x, y));
            Ok(json!(true))
        }),
        "browserWindow.getPosition" => with_window(params, |w| {
            let pos = w.window.outer_position().map_err(|e| format!("{}", e))?;
            Ok(json!([pos.x, pos.y]))
        }),
        "browserWindow.center" => with_window(params, |w| {
            if let Some(monitor) = w.window.current_monitor() {
                let screen_size = monitor.size();
                let screen_pos = monitor.position();
                let win_size = w.window.outer_size();
                let x = screen_pos.x + ((screen_size.width as i32 - win_size.width as i32) / 2);
                let y = screen_pos.y + ((screen_size.height as i32 - win_size.height as i32) / 2);
                w.window.set_outer_position(tao::dpi::PhysicalPosition::new(x, y));
            }
            Ok(json!(true))
        }),
        "browserWindow.setOpacity" => with_window(params, |w| {
            let opacity = params.get("opacity").and_then(|v| v.as_f64()).unwrap_or(1.0);
            #[cfg(target_os = "windows")]
            {
                use raw_window_handle::HasWindowHandle;
                if let Ok(handle) = w.window.window_handle() {
                    let raw = handle.as_raw();
                    let hwnd = match raw {
                        raw_window_handle::RawWindowHandle::Win32(h) => h.hwnd.get() as isize,
                        _ => return Err("Unsupported platform".to_string()),
                    };
                    const GWL_EXSTYLE: i32 = -20;
                    const WS_EX_LAYERED: i32 = 0x00080000;
                    const LWA_ALPHA: u32 = 0x02;
                    unsafe {
                        let ex_style = GetWindowLongW(hwnd, GWL_EXSTYLE);
                        SetWindowLongW(hwnd, GWL_EXSTYLE, ex_style | WS_EX_LAYERED);
                        let alpha = if opacity <= 0.0 { 0u8 } else if opacity >= 1.0 { 255u8 } else { (opacity * 255.0) as u8 };
                        SetLayeredWindowAttributes(hwnd, 0, alpha, LWA_ALPHA);
                    }
                }
            }
            Ok(json!(true))
        }),
        "browserWindow.setBackgroundColor" => with_window(params, |w| {
            let color_str = params.get("color").and_then(|v| v.as_str()).unwrap_or("#ffffff");
            let (r, g, b, a) = parse_color(color_str);
            w.window.set_background_color(Some((r, g, b, a)));
            Ok(json!(true))
        }),
        "browserWindow.reload" => with_window(params, |w| {
            let _ = w.webview.reload();
            Ok(json!(true))
        }),
        "browserWindow.loadURL" => with_window(params, |w| {
            let url = params.get("url").and_then(|v| v.as_str()).unwrap_or("");
            let _ = w.webview.load_url(url);
            Ok(json!(true))
        }),
        "browserWindow.loadFile" => with_window(params, |w| {
            let path = params.get("path").and_then(|v| v.as_str()).unwrap_or("");
            let url = format!("file://{}", path.replace('\\', "/"));
            let _ = w.webview.load_url(&url);
            Ok(json!(true))
        }),
        "browserWindow.setProgressBar" => with_window(params, |w| {
            let progress = params.get("progress").and_then(|v| v.as_f64()).unwrap_or(-1.0);
            let state = if progress < 0.0 {
                tao::window::ProgressBarState {
                    state: Some(tao::window::ProgressState::None),
                    progress: None,
                    desktop_filename: None,
                }
            } else if progress >= 1.0 {
                tao::window::ProgressBarState {
                    state: Some(tao::window::ProgressState::Paused),
                    progress: Some(100),
                    desktop_filename: None,
                }
            } else {
                tao::window::ProgressBarState {
                    state: Some(tao::window::ProgressState::Normal),
                    progress: Some((progress * 100.0) as u64),
                    desktop_filename: None,
                }
            };
            w.window.set_progress_bar(state);
            Ok(json!(true))
        }),
        "browserWindow.setSkipTaskbar" => with_window(params, |w| {
            let flag = params.get("flag").and_then(|v| v.as_bool()).unwrap_or(true);
            #[cfg(target_os = "windows")]
            {
                use raw_window_handle::HasWindowHandle;
                if let Ok(handle) = w.window.window_handle() {
                    let raw = handle.as_raw();
                    let hwnd = match raw {
                        raw_window_handle::RawWindowHandle::Win32(h) => h.hwnd.get() as isize,
                        _ => return Err("Unsupported platform".to_string()),
                    };
                    const GWL_EXSTYLE: i32 = -20;
                    const WS_EX_APPWINDOW: i32 = 0x00040000;
                    const WS_EX_TOOLWINDOW: i32 = 0x00000080;
                    unsafe {
                        let ex_style = GetWindowLongW(hwnd, GWL_EXSTYLE);
                        if flag {
                            // 隐藏：去掉 APPWINDOW，加上 TOOLWINDOW
                            SetWindowLongW(hwnd, GWL_EXSTYLE, (ex_style & !WS_EX_APPWINDOW) | WS_EX_TOOLWINDOW);
                        } else {
                            // 显示：加上 APPWINDOW，去掉 TOOLWINDOW
                            SetWindowLongW(hwnd, GWL_EXSTYLE, (ex_style | WS_EX_APPWINDOW) & !WS_EX_TOOLWINDOW);
                        }
                    }
                }
            }
            Ok(json!(true))
        }),
        "browserWindow.capturePage" => with_window(params, |_| {
            Err("capturePage not yet implemented".to_string())
        }),
        "browserWindow.setIcon" => with_window(params, |w| {
            let icon_path = params.get("icon").and_then(|v| v.as_str()).unwrap_or("");
            if icon_path.is_empty() {
                w.window.set_window_icon(None);
            } else {
                let image = crate::utils::load_image(icon_path);
                w.window.set_window_icon(image);
            }
            Ok(json!(true))
        }),
        "browserWindow.blur" => with_window(params, |w| {
            w.window.set_minimized(true);
            w.window.set_minimized(false);
            Ok(json!(true))
        }),
        "browserWindow.flashTaskbar" => with_window(params, |w| {
            #[cfg(target_os = "windows")]
            {
                use raw_window_handle::HasWindowHandle;
                if let Ok(handle) = w.window.window_handle() {
                    let raw = handle.as_raw();
                    let hwnd = match raw {
                        raw_window_handle::RawWindowHandle::Win32(h) => h.hwnd.get() as isize,
                        _ => return Err("Unsupported platform".to_string()),
                    };
                    let flag = params.get("flag").and_then(|v| v.as_bool()).unwrap_or(true);
                    // FLASHW_ALL = 3 (任务栏 + 标题栏), FLASHW_TIMERNOFG = 12 (未激活时闪烁)
                    let dw_flags = if flag { 3u32 } else { 0u32 };
                    unsafe {
                        let info = FLASHWINFO {
                            cb_size: std::mem::size_of::<FLASHWINFO>() as u32,
                            hwnd,
                            dw_flags,
                            u_count: if flag { 5 } else { 0 },
                            dw_timeout: 0,
                        };
                        FlashWindowEx(&info);
                    }
                }
            }
            Ok(json!(true))
        }),
        _ => Err(format!("Unknown method: {}", method)),
    }
}

/// 从 params 中提取 window_id 并执行操作
fn with_window<F>(params: &Value, f: F) -> Result<Value, String>
where
    F: FnOnce(&crate::window_manager::WindowEntry) -> Result<Value, String>,
{
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    crate::window_manager::MANAGER.with(|m| {
        let manager = m.borrow();
        let entry = manager.get(id).ok_or_else(|| format!("Window {} not found", id))?;
        f(entry)
    })
}

fn get_all(_params: &Value) -> Result<Value, String> {
    let ids = crate::window_manager::get_all_ids();
    let mut windows = Vec::new();
    for id in ids {
        let info = crate::window_manager::MANAGER.with(|m| {
            let manager = m.borrow();
            manager.get(id).map(|entry| entry.get_info(id))
        });
        if let Some(info) = info {
            windows.push(serde_json::to_value(info).unwrap_or_default());
        }
    }
    Ok(json!(windows))
}

fn get_focused(_params: &Value) -> Result<Value, String> {
    let ids = crate::window_manager::get_all_ids();
    for id in ids {
        let found = crate::window_manager::MANAGER.with(|m| {
            let manager = m.borrow();
            if let Some(entry) = manager.get(id) {
                if entry.window.is_focused() {
                    return Some(entry.get_info(id));
                }
            }
            None
        });
        if let Some(info) = found {
            return Ok(serde_json::to_value(info).unwrap_or_default());
        }
    }
    Ok(json!(null))
}

fn get_by_id(params: &Value) -> Result<Value, String> {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    crate::window_manager::MANAGER.with(|m| {
        let manager = m.borrow();
        match manager.get(id) {
            Some(entry) => Ok(serde_json::to_value(entry.get_info(id)).unwrap_or_default()),
            None => Ok(json!(null)),
        }
    })
}

/// 解析颜色字符串为 RGBA 元组（支持 #RRGGBB 和 #RRGGBBAA 格式）
fn parse_color(color: &str) -> (u8, u8, u8, u8) {
    let hex = color.trim_start_matches('#');
    let r = u8::from_str_radix(&hex[0..2.min(hex.len())], 16).unwrap_or(255);
    let g = u8::from_str_radix(&hex[2..4.min(hex.len())], 16).unwrap_or(255);
    let b = u8::from_str_radix(&hex[4..6.min(hex.len())], 16).unwrap_or(255);
    let a = if hex.len() >= 8 {
        u8::from_str_radix(&hex[6..8], 16).unwrap_or(255)
    } else {
        255
    };
    (r, g, b, a)
}
