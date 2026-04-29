use crate::app_config::{self, PermissionSet, FsPermission, ShellPermission, HttpPermission, ProcessPermission};

/// 判断 URL 是否为本地内容
fn is_local_url(url: &str) -> bool {
    // vokex:// 协议是本地内容（生产模式）
    if url.starts_with("vokex://") {
        return true;
    }

    // http://localhost 或 http://127.0.0.1 是开发模式
    if url.starts_with("http://localhost") || url.starts_with("http://127.0.0.1") {
        return true;
    }

    // file:// 协议是本地文件
    if url.starts_with("file://") {
        return true;
    }

    // 其他 http/https 地址视为远程
    false
}

/// 获取本地页面的全权限配置
fn get_local_permissions() -> &'static PermissionSet {
    // 使用 Box::leak 创建静态生命周期的引用
    Box::leak(Box::new(PermissionSet {
        fs: FsPermission { allowed: true, sandbox: vec![] },
        shell: ShellPermission { allowed: true, commands: vec![] },
        http: HttpPermission { allowed: true, block_internal: false },
        process: ProcessPermission { allowed: true, allow_kill: true, env_keys: vec![] },
    }))
}

/// 获取指定窗口的权限集
pub fn get_permissions(window_id: u32) -> &'static PermissionSet {
    // 获取窗口的 URL
    let url = crate::window_manager::get_window_url(window_id)
        .unwrap_or_default();

    // 本地页面：直接返回全权限
    if is_local_url(&url) {
        return get_local_permissions();
    }

    // 远程页面：返回配置中的权限
    let config = app_config::get_config();
    &config.permissions.remote
}

/// 检查模块是否被允许
pub fn check_module(window_id: u32, module: &str) -> Result<(), String> {
    let perms = get_permissions(window_id);
    let allowed = match module {
        "fs" => perms.fs.allowed,
        "shell" => perms.shell.allowed,
        "http" => perms.http.allowed,
        "process" => perms.process.allowed,
        _ => true, // app, browserWindow, storage, clipboard, dialog, notification, computer, tray 等默认允许
    };
    if allowed {
        Ok(())
    } else {
        Err(format!("Permission denied: {} is not allowed for window {}", module, window_id))
    }
}
