//! 窗口管理器 - 真正支持多窗口、无锁设计

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::atomic::{AtomicU32, Ordering};
use serde::{Deserialize, Serialize};
use tao::window::{Window, WindowId};
use wry::WebView;

/// 窗口选项
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct WindowOptions {
    pub title: Option<String>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub resizable: Option<bool>,
    pub minimizable: Option<bool>,
    pub maximizable: Option<bool>,
    pub closable: Option<bool>,
    pub always_on_top: Option<bool>,
    pub fullscreen: Option<bool>,
    pub skip_taskbar: Option<bool>,
    pub opacity: Option<f64>,
    pub background_color: Option<String>,
    pub min_width: Option<u32>,
    pub min_height: Option<u32>,
    pub max_width: Option<u32>,
    pub max_height: Option<u32>,
    pub icon: Option<String>,
    pub show: Option<bool>,
    pub center: Option<bool>,
    pub url: Option<String>,
}

/// 窗口信息
#[derive(Debug, Clone, Serialize)]
pub struct WindowInfo {
    pub id: u32,
    pub title: String,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub is_maximized: bool,
    pub is_minimized: bool,
    pub is_fullscreen: bool,
    pub is_focused: bool,
    pub is_visible: bool,
}

/// 一个完整的窗口实例
struct VokexWindow {
    id: u32,
    window: Rc<Window>,
    webview: WebView,
}

impl VokexWindow {
    fn new(id: u32, window: Window, webview: WebView) -> Self {
        Self {
            id,
            window: Rc::new(window),
            webview,
        }
    }

    fn window_id(&self) -> WindowId {
        self.window.id()
    }

    fn get_info(&self) -> WindowInfo {
        let size = self.window.inner_size();
        let (x, y) = match self.window.outer_position() {
            Ok(pos) => (pos.x, pos.y),
            Err(_) => (0, 0),
        };

        WindowInfo {
            id: self.id,
            title: self.window.title(),
            width: size.width,
            height: size.height,
            x,
            y,
            is_maximized: self.window.is_maximized(),
            is_minimized: self.window.is_minimized(),
            is_fullscreen: self.window.fullscreen().is_some(),
            is_focused: self.window.is_focused(),
            is_visible: self.window.is_visible(),
        }
    }
}

/// 窗口管理器
struct WindowManagerInner {
    next_id: u32,
    main_window_id: Option<u32>,
    windows: HashMap<u32, VokexWindow>,
    window_id_map: HashMap<WindowId, u32>,
}

impl WindowManagerInner {
    fn new() -> Self {
        Self {
            next_id: 1,
            main_window_id: None,
            windows: HashMap::new(),
            window_id_map: HashMap::new(),
        }
    }

    fn register_main_window(&mut self, window: Window, webview: WebView) -> u32 {
        let id = self.next_id;
        self.main_window_id = Some(id);
        self.next_id += 1;
        
        let window_id = window.id();
        let vokex_window = VokexWindow::new(id, window, webview);
        self.window_id_map.insert(window_id, id);
        self.windows.insert(id, vokex_window);
        id
    }

    fn register_window(&mut self, window: Window, webview: WebView) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        
        let window_id = window.id();
        let vokex_window = VokexWindow::new(id, window, webview);
        self.window_id_map.insert(window_id, id);
        self.windows.insert(id, vokex_window);
        id
    }

    fn unregister_window(&mut self, id: u32) -> bool {
        if let Some(window) = self.windows.remove(&id) {
            self.window_id_map.remove(&window.window_id());
            true
        } else {
            false
        }
    }

    fn get_window(&self, id: u32) -> Option<&VokexWindow> {
        self.windows.get(&id)
    }

    fn get_window_by_tao_id(&self, tao_id: WindowId) -> Option<&VokexWindow> {
        self.window_id_map
            .get(&tao_id)
            .and_then(|&id| self.windows.get(&id))
    }

    fn get_main_window(&self) -> Option<&VokexWindow> {
        self.main_window_id.and_then(|id| self.windows.get(&id))
    }

    fn get_all_window_ids(&self) -> Vec<u32> {
        self.windows.keys().copied().collect()
    }

    fn get_focused_window(&self) -> Option<&VokexWindow> {
        self.windows
            .values()
            .find(|w| w.window.is_focused())
    }
}

/// 线程安全的窗口管理器
pub struct WindowManager {
    inner: RefCell<WindowManagerInner>,
}

impl WindowManager {
    fn new() -> Self {
        Self {
            inner: RefCell::new(WindowManagerInner::new()),
        }
    }
}

thread_local! {
    static WINDOW_MANAGER: Rc<WindowManager> = Rc::new(WindowManager::new());
}

/// 全局存储主窗口ID，供工作线程读取
static MAIN_WINDOW_ID: AtomicU32 = AtomicU32::new(0);
const NO_MAIN_WINDOW: u32 = 0;

/// 初始化窗口管理器
pub fn init_window_manager() {
    WINDOW_MANAGER.with(|_| {});
}

/// 获取窗口管理器（仅限主线程使用）
pub fn get_window_manager() -> Rc<WindowManager> {
    WINDOW_MANAGER.with(|wm| wm.clone())
}

/// 获取主窗口ID（线程安全，可从任何线程调用）
pub fn get_main_window_id_global() -> Option<u32> {
    let id = MAIN_WINDOW_ID.load(Ordering::Relaxed);
    if id == NO_MAIN_WINDOW { None } else { Some(id) }
}

// 公开的方法
impl WindowManager {
    pub fn register_main_window(&self, window: Window, webview: WebView) -> u32 {
        let mut inner = self.inner.borrow_mut();
        let id = inner.register_main_window(window, webview);
        // 同步到全局原子变量
        MAIN_WINDOW_ID.store(id, Ordering::Relaxed);
        id
    }

    pub fn register_window(&self, window: Window, webview: WebView) -> u32 {
        let mut inner = self.inner.borrow_mut();
        inner.register_window(window, webview)
    }

    pub fn unregister_window(&self, id: u32) -> bool {
        let mut inner = self.inner.borrow_mut();
        inner.unregister_window(id)
    }

    pub fn get_window_id_by_tao_id(&self, tao_id: WindowId) -> Option<u32> {
        let inner = self.inner.borrow();
        inner.window_id_map.get(&tao_id).copied()
    }

    pub fn get_main_window_id(&self) -> Option<u32> {
        let inner = self.inner.borrow();
        inner.main_window_id
    }

    pub fn get_all_window_ids(&self) -> Vec<u32> {
        let inner = self.inner.borrow();
        inner.get_all_window_ids()
    }

    pub fn get_window_info(&self, id: u32) -> Option<WindowInfo> {
        let inner = self.inner.borrow();
        inner.get_window(id).map(|w| w.get_info())
    }

    pub fn get_main_window_info(&self) -> Option<WindowInfo> {
        let inner = self.inner.borrow();
        inner.get_main_window().map(|w| w.get_info())
    }

    pub fn get_focused_window_info(&self) -> Option<WindowInfo> {
        let inner = self.inner.borrow();
        inner.get_focused_window().map(|w| w.get_info())
    }

    /// 获取 tao Window 的 Rc 引用
    pub fn with_window<F, R>(&self, id: u32, f: F) -> Option<R>
    where
        F: FnOnce(&Rc<Window>) -> R,
    {
        let inner = self.inner.borrow();
        inner.get_window(id).map(|w| f(&w.window))
    }

    pub fn with_main_window<F, R>(&self, f: F) -> Option<R>
    where
        F: FnOnce(&Rc<Window>) -> R,
    {
        let inner = self.inner.borrow();
        inner.get_main_window().map(|w| f(&w.window))
    }

    pub fn with_webview<F, R>(&self, id: u32, f: F) -> Option<R>
    where
        F: FnOnce(&WebView) -> R,
    {
        let inner = self.inner.borrow();
        inner.get_window(id).map(|w| f(&w.webview))
    }

    pub fn with_main_webview<F, R>(&self, f: F) -> Option<R>
    where
        F: FnOnce(&WebView) -> R,
    {
        let inner = self.inner.borrow();
        inner.get_main_window().map(|w| f(&w.webview))
    }

    pub fn evaluate_script_for_window(&self, id: u32, script: &str) {
        let inner = self.inner.borrow();
        if let Some(window) = inner.get_window(id) {
            let _ = window.webview.evaluate_script(script);
        }
    }

    pub fn evaluate_script_for_main_window(&self, script: &str) {
        let inner = self.inner.borrow();
        if let Some(window) = inner.get_main_window() {
            let _ = window.webview.evaluate_script(script);
        }
    }
    
    /// 向前端推送事件
    pub fn emit_event(&self, window_id: u32, event: &str, data: serde_json::Value) {
        let script = format!(
            "window.__VOKEX__.__emit('{}', {})",
            event,
            serde_json::to_string(&data).unwrap_or("null".to_string())
        );
        self.evaluate_script_for_window(window_id, &script);
    }
    
    /// 向所有窗口推送事件
    pub fn emit_event_to_all(&self, event: &str, data: serde_json::Value) {
        let window_ids = self.get_all_window_ids();
        for window_id in window_ids {
            self.emit_event(window_id, event, data.clone());
        }
    }
}
