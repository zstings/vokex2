use std::sync::OnceLock;
use serde::Deserialize;
use crate::Resources;

#[derive(Deserialize, Default, Clone, Debug)]
pub struct AppConfigSx {
    pub identifier: String,
    pub name: String,
    pub version: String,
    pub icon: String,
    pub window: AppConfigWindowSx,
    pub dev_url: Option<String>,
}

#[derive(Deserialize, Default, Clone, Debug)]
pub struct AppConfigWindowSx {
    pub title: String,
    pub width: u32,
    pub height: u32,
}

static GLOBAL_CONFIG: OnceLock<AppConfigSx> = OnceLock::new();

pub fn init_app_config() {
    let config = load_config();
    GLOBAL_CONFIG.set(config).expect("Failed to initialize app config");
}

#[cfg(debug_assertions)]
fn load_config() -> AppConfigSx {
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

#[cfg(not(debug_assertions))]
fn load_config() -> AppConfigSx {
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
