use std::cell::RefCell;
use std::sync::Arc;
use crate::Resources;

thread_local! {
    pub static RESOURCES: RefCell<Option<Arc<Resources>>> = RefCell::new(None);
}

pub fn init(resources: Arc<Resources>) {
    RESOURCES.with(|r| {
        *r.borrow_mut() = Some(resources);
    });
}

/// 统一资源加载
/// 开发模式：从文件系统读取（exe 所在目录 + path）
/// 正式模式：从嵌入资源读取
pub fn load(path: &str) -> Option<Vec<u8>> {
    #[cfg(debug_assertions)]
    {
        let exe_dir = std::env::current_exe().ok()?.parent()?.to_path_buf();
        let full_path = exe_dir.join(path);
        std::fs::read(&full_path).ok()
    }
    #[cfg(not(debug_assertions))]
    {
        RESOURCES.with(|r| {
            r.borrow().as_ref().and_then(|res| res.get(path).map(|data| data.to_vec()))
        })
    }
}