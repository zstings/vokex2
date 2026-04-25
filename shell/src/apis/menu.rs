use serde_json::Value;
use muda::{Menu, MenuItem, CheckMenuItem, Submenu, PredefinedMenuItem};

fn build_menu_items(items: &Value) -> Result<Vec<Box<dyn muda::IsMenuItem>>, String> {
    let mut result: Vec<Box<dyn muda::IsMenuItem>> = Vec::new();
    if let Some(arr) = items.as_array() {
        for item in arr {
            if let Some(obj) = item.as_object() {
                let item_type = obj.get("type").and_then(|v| v.as_str()).unwrap_or("normal");
                match item_type {
                    "separator" => {
                        result.push(Box::new(PredefinedMenuItem::separator()));
                    }
                    "submenu" => {
                        let label = obj.get("label").and_then(|v| v.as_str()).unwrap_or("");
                        let submenu_value = obj.get("submenu").cloned().unwrap_or(Value::Array(vec![]));
                        let sub_items = build_menu_items(&submenu_value)?;
                        let refs: Vec<&dyn muda::IsMenuItem> = sub_items.iter().map(|i| i.as_ref()).collect();
                        let submenu = Submenu::with_items(label, true, &refs)
                            .map_err(|e| format!("Failed to create submenu: {}", e))?;
                        result.push(Box::new(submenu));
                    }
                    "checkbox" => {
                        let label = obj.get("label").and_then(|v| v.as_str()).unwrap_or("");
                        let enabled = obj.get("enabled").and_then(|v| v.as_bool()).unwrap_or(true);
                        let checked = obj.get("checked").and_then(|v| v.as_bool()).unwrap_or(false);
                        let id = obj.get("id").and_then(|v| v.as_str()).unwrap_or("");
                        let menu_item = CheckMenuItem::with_id(id, label, enabled, checked, None);
                        result.push(Box::new(menu_item));
                    }
                    _ => {
                        let label = obj.get("label").and_then(|v| v.as_str()).unwrap_or("");
                        let enabled = obj.get("enabled").and_then(|v| v.as_bool()).unwrap_or(true);
                        let id = obj.get("id").and_then(|v| v.as_str()).unwrap_or("");
                        let menu_item = MenuItem::with_id(id, label, enabled, None);
                        result.push(Box::new(menu_item));
                    }
                }
            }
        }
    }
    Ok(result)
}

pub fn build_menu(items: &Value) -> Result<Menu, String> {
    let menu = Menu::new();
    let menu_items = build_menu_items(items)?;
    for item in &menu_items {
        menu.append(item.as_ref()).map_err(|e| format!("{}", e))?;
    }
    Ok(menu)
}
