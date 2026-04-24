use std::cell::RefCell;
use std::collections::HashMap;
use wry::WebView;

/// 窗口管理器 - 存储所有窗口的 WebView
/// 只在主线程使用，所以用 RefCell 不需要 Mutex
pub struct WindowManager {
    next_id: u32,
    windows: HashMap<u32, WebView>,
}

impl WindowManager {
    pub fn new() -> Self {
        Self {
            next_id: 1,
            windows: HashMap::new(),
        }
    }

    /// 注册窗口，返回分配的窗口 ID
    pub fn register(&mut self, webview: WebView) -> u32 {
        let id = self.next_id;
        self.next_id += 1;
        self.windows.insert(id, webview);
        id
    }

    /// 注销窗口
    pub fn unregister(&mut self, id: u32) {
        self.windows.remove(&id);
    }

    /// 向指定窗口执行 JS 脚本
    pub fn eval(&self, id: u32, script: &str) {
        if let Some(wv) = self.windows.get(&id) {
            let _ = wv.evaluate_script(script);
        }
    }

    /// 向所有窗口执行 JS 脚本
    pub fn eval_all(&self, script: &str) {
        for wv in self.windows.values() {
            let _ = wv.evaluate_script(script);
        }
    }
}

// 全局单例，thread_local 因为只在主线程用
thread_local! {
    static MANAGER: RefCell<WindowManager> = RefCell::new(WindowManager::new());
}

/// 注册窗口，返回窗口 ID
pub fn register(webview: WebView) -> u32 {
    MANAGER.with(|m| m.borrow_mut().register(webview))
}

/// 注销窗口
pub fn unregister(id: u32) {
    MANAGER.with(|m| m.borrow_mut().unregister(id));
}

/// 向指定窗口执行 JS
pub fn eval(id: u32, script: &str) {
    MANAGER.with(|m| m.borrow().eval(id, script));
}

/// 向所有窗口执行 JS
pub fn eval_all(script: &str) {
    MANAGER.with(|m| m.borrow().eval_all(script));
}

/// 预分配下一个窗口 ID（不注册 WebView）
pub fn next_id() -> u32 {
    MANAGER.with(|m| {
        let id = m.borrow().next_id;
        m.borrow_mut().next_id += 1;
        id
    })
}

/// 用指定 ID 注册窗口
pub fn register_with_id(id: u32, webview: WebView) {
    MANAGER.with(|m| {
        m.borrow_mut().windows.insert(id, webview);
    });
}