use std::sync::OnceLock;
use serde::Deserialize;
use crate::Resources;

#[derive(Deserialize, Default, Clone, Debug)]
#[serde(default)]
pub struct AppConfigSx {
    pub identifier: String,
    pub name: String,
    pub version: String,
    pub icon: String,
    pub window: AppConfigWindowSx,
    pub dev_url: Option<String>,
    pub devtools: bool,
    pub new_window: AppConfigNewWindow,
    pub is_dev: bool,
    pub permissions: PermissionsConfig,
}

/// 权限配置（仅针对远程页面，本地页面默认拥有全部权限）
#[derive(Deserialize, Clone, Debug)]
#[serde(default)]
pub struct PermissionsConfig {
    /// 远程页面权限（http/https 外部地址）
    pub remote: PermissionSet,
}

impl Default for PermissionsConfig {
    fn default() -> Self {
        Self {
            remote: PermissionSet::default_remote(),
        }
    }
}

/// 权限集合
#[derive(Deserialize, Clone, Debug)]
#[serde(default)]
pub struct PermissionSet {
    pub fs: FsPermission,
    pub shell: ShellPermission,
    pub http: HttpPermission,
    pub process: ProcessPermission,
}

impl Default for PermissionSet {
    fn default() -> Self {
        Self::default_remote()
    }
}

impl PermissionSet {
    /// 远程页面默认：全部禁止
    pub fn default_remote() -> Self {
        Self {
            fs: FsPermission { allowed: false, sandbox: vec![] },
            shell: ShellPermission { allowed: false, commands: vec![] },
            http: HttpPermission { allowed: false, block_internal: true },
            process: ProcessPermission { allowed: false, allow_kill: false, env_keys: vec![] },
        }
    }
}

/// 文件系统权限
#[derive(Deserialize, Clone, Debug)]
#[serde(default)]
pub struct FsPermission {
    /// 是否允许访问
    pub allowed: bool,
    /// 允许的路径前缀列表，空 = 不限制
    pub sandbox: Vec<String>,
}

impl Default for FsPermission {
    fn default() -> Self {
        Self { allowed: false, sandbox: vec![] }
    }
}

/// Shell 命令权限
#[derive(Deserialize, Clone, Debug)]
#[serde(default)]
pub struct ShellPermission {
    /// 是否允许执行命令
    pub allowed: bool,
    /// 允许的命令前缀列表，空 = 不限制
    pub commands: Vec<String>,
}

impl Default for ShellPermission {
    fn default() -> Self {
        Self { allowed: false, commands: vec![] }
    }
}

/// HTTP 请求权限
#[derive(Deserialize, Clone, Debug)]
#[serde(default)]
pub struct HttpPermission {
    /// 是否允许发起 HTTP 请求
    pub allowed: bool,
    /// 是否阻止内网地址
    pub block_internal: bool,
}

impl Default for HttpPermission {
    fn default() -> Self {
        Self { allowed: false, block_internal: true }
    }
}

/// 进程管理权限
#[derive(Deserialize, Clone, Debug)]
#[serde(default)]
pub struct ProcessPermission {
    /// 是否允许访问进程信息
    pub allowed: bool,
    /// 是否允许杀死进程
    pub allow_kill: bool,
    /// 允许的环境变量 key 列表，空 = 不限制
    pub env_keys: Vec<String>,
}

impl Default for ProcessPermission {
    fn default() -> Self {
        Self { allowed: false, allow_kill: false, env_keys: vec![] }
    }
}

#[derive(Deserialize, Default, Clone, Debug)]
pub struct AppConfigWindowSx {
    pub title: String,
    pub width: u32,
    pub height: u32,
}

#[derive(Deserialize, Default, Clone, Debug)]
pub struct AppConfigNewWindow {
    pub value: u32,
    pub width: Option<u32>,
    pub height: Option<u32>,
}

static GLOBAL_CONFIG: OnceLock<AppConfigSx> = OnceLock::new();

pub fn init_app_config() {
    // 检查命令行参数中是否包含 "--env_dev"
    let is_dev = std::env::args().any(|arg| arg == "--env_dev");
    let mut config = load_config(is_dev);
    config.is_dev = is_dev;
    GLOBAL_CONFIG.set(config).expect("Failed to initialize app config");
}

fn load_config(is_dev: bool) -> AppConfigSx {
    if is_dev {
        return load_config_dev();
    } else {
        return load_config_prod();
    }
}

fn load_config_dev() -> AppConfigSx {
    // 读取壳目录下的 vokex-config.json
    let config_path = std::env::current_exe()
        .expect("Failed to get exe path")
        .parent()
        .expect("Failed to get exe directory")
        .join("vokex-config.json");

    let config_json = std::fs::read_to_string(&config_path)
        .expect("Failed to read vokex-config.json");

    serde_json::from_str(&config_json)
        .expect("Failed to parse vokex-config.json")
}

fn load_config_prod() -> AppConfigSx {
    let exe_path = std::env::current_exe()
        .expect("Failed to get current exe path");
    
    let resources = Resources::load_from_exe(&exe_path)
        .expect("Failed to load resources from exe");
    
    let config_bytes = resources.get("vokex-config.json")
        .expect("vokex-config.json not found in resources");

    let config_json = String::from_utf8(config_bytes.to_vec())
        .expect("vokex-config.json is not valid UTF-8");

    serde_json::from_str(&config_json)
        .expect("Failed to parse vokex-config.json")
}

pub fn get_config() -> &'static AppConfigSx {
    GLOBAL_CONFIG.get().expect("App config not initialized")
}

#[cfg(test)]
pub fn init_test_config() {
    let config = AppConfigSx {
        identifier: "com.vokex.test".to_string(),
        name: "Vokex Test".to_string(),
        version: "0.1.0".to_string(),
        icon: "".to_string(),
        window: AppConfigWindowSx {
            title: "Test".to_string(),
            width: 800,
            height: 600,
        },
        ..Default::default()
    };
    // OnceLock::set 只会成功一次，后续调用自动忽略
    let _ = GLOBAL_CONFIG.set(config);
}
