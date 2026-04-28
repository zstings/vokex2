use serde_json::{json, Value};
use std::cell::RefCell;
use std::collections::HashMap;
use tray_icon::{TrayIcon, TrayIconBuilder, Icon};

struct TrayEntry {
    icon: TrayIcon,
}

thread_local! {
    static TRAY_STORE: RefCell<HashMap<u32, TrayEntry>> = RefCell::new(HashMap::new());
    static NEXT_TRAY_ID: RefCell<u32> = RefCell::new(1);
}

pub fn handle(method: &str, params: &Value) -> Result<Value, String> {
    match method {
        "tray.create" => create(params),
        "tray.setToolTip" => set_tooltip(params),
        "tray.setImage" => set_image(params),
        "tray.setMenu" => set_menu(params),
        "tray.setTitle" => set_title(params),
        "tray.destroy" => destroy(params),
        _ => Err(format!("Unknown tray method: {}", method)),
    }
}

/// 加载托盘图标 —— 与 utils::load_image 逻辑一致：
/// 开发模式从 exe 同目录读 PNG，正式模式从嵌入资源读 PNG，解码为 RGBA 后创建
fn load_tray_icon(icon_path: &str) -> Result<Icon, String> {
    let data = if crate::app_config::get_config().is_dev {
        let exe_dir = std::env::current_exe()
            .map_err(|e| format!("Failed to get exe path: {}", e))?
            .parent()
            .ok_or("Failed to get exe directory")?
            .to_path_buf();
        std::fs::read(exe_dir.join(icon_path))
            .map_err(|e| format!("Failed to read icon '{}': {}", icon_path, e))?
    } else {
        let exe_path = std::env::current_exe()
            .map_err(|e| format!("Failed to get exe path: {}", e))?;
        let resources = crate::Resources::load_from_exe(&exe_path)
            .map_err(|e| format!("Failed to load resources: {}", e))?;
        resources.get(icon_path)
            .ok_or_else(|| format!("Icon '{}' not found in resources", icon_path))?
            .to_vec()
    };

    let decoder = png::Decoder::new(std::io::Cursor::new(&data));
    let mut reader = decoder.read_info()
        .map_err(|e| format!("Failed to decode PNG: {}", e))?;
    let mut buf = vec![0u8; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf)
        .map_err(|e| format!("Failed to read PNG frame: {}", e))?;

    let rgba = match info.color_type {
        png::ColorType::Rgba => buf[..info.buffer_size()].to_vec(),
        png::ColorType::Rgb => {
            let rgb = &buf[..info.buffer_size()];
            let mut rgba = Vec::with_capacity(rgb.len() / 3 * 4);
            for chunk in rgb.chunks(3) {
                rgba.push(chunk[0]);
                rgba.push(chunk[1]);
                rgba.push(chunk[2]);
                rgba.push(255);
            }
            rgba
        }
        _ => return Err(format!("Unsupported PNG color type: {:?}", info.color_type)),
    };

    Icon::from_rgba(rgba, info.width, info.height)
        .map_err(|e| format!("Failed to create tray icon from RGBA: {}", e))
}

fn create(params: &Value) -> Result<Value, String> {
    let icon_path = params.get("icon").and_then(|v| v.as_str())
        .ok_or("Missing 'icon' parameter")?;
    let tooltip = params.get("tooltip").and_then(|v| v.as_str()).unwrap_or("");
    let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("");

    let icon = load_tray_icon(icon_path)?;

    let mut builder = TrayIconBuilder::new()
        .with_icon(icon)
        .with_tooltip(tooltip);

    if !title.is_empty() {
        builder = builder.with_title(title);
    }

    if let Some(menu_value) = params.get("menu") {
        let menu = crate::apis::menu::build_menu(menu_value)?;
        builder = builder.with_menu(Box::new(menu));
    }

    let tray_icon = builder.build()
        .map_err(|e| format!("Failed to create tray icon: {}", e))?;

    let id = NEXT_TRAY_ID.with(|n| {
        let mut n = n.borrow_mut();
        let id = *n;
        *n += 1;
        id
    });

    TRAY_STORE.with(|store| {
        store.borrow_mut().insert(id, TrayEntry { icon: tray_icon });
    });

    Ok(json!(id))
}

fn set_tooltip(params: &Value) -> Result<Value, String> {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let text = params.get("text").and_then(|v| v.as_str())
        .ok_or("Missing 'text' parameter")?;

    TRAY_STORE.with(|store| {
        let store = store.borrow();
        if let Some(entry) = store.get(&id) {
            entry.icon.set_tooltip(Some(text))
                .map_err(|e| format!("{}", e))?;
            Ok(json!(true))
        } else {
            Err(format!("Tray {} not found", id))
        }
    })
}

fn set_image(params: &Value) -> Result<Value, String> {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let icon_path = params.get("icon").and_then(|v| v.as_str())
        .ok_or("Missing 'icon' parameter")?;

    let icon = load_tray_icon(icon_path)?;

    TRAY_STORE.with(|store| {
        let store = store.borrow();
        if let Some(entry) = store.get(&id) {
            entry.icon.set_icon(Some(icon))
                .map_err(|e| format!("{}", e))?;
            Ok(json!(true))
        } else {
            Err(format!("Tray {} not found", id))
        }
    })
}

fn set_menu(params: &Value) -> Result<Value, String> {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let menu_value = params.get("menu").ok_or("Missing 'menu' parameter")?;

    let menu = crate::apis::menu::build_menu(menu_value)?;

    TRAY_STORE.with(|store| {
        let store = store.borrow();
        if let Some(entry) = store.get(&id) {
            entry.icon.set_menu(Some(Box::new(menu)));
            Ok(json!(true))
        } else {
            Err(format!("Tray {} not found", id))
        }
    })
}

fn set_title(params: &Value) -> Result<Value, String> {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let title = params.get("title").and_then(|v| v.as_str()).unwrap_or("");

    TRAY_STORE.with(|store| {
        let store = store.borrow();
        if let Some(entry) = store.get(&id) {
            entry.icon.set_title(Some(title));
            Ok(json!(true))
        } else {
            Err(format!("Tray {} not found", id))
        }
    })
}

fn destroy(params: &Value) -> Result<Value, String> {
    let id = params.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as u32;

    TRAY_STORE.with(|store| {
        if store.borrow_mut().remove(&id).is_some() {
            Ok(json!(true))
        } else {
            Err(format!("Tray {} not found", id))
        }
    })
}
